"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BugForm } from "@/components/BugForm";
import { ImageUploader } from "@/components/ImageUploader";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { OcrPanel } from "@/components/OcrPanel";
import { RecentReports } from "@/components/RecentReports";
import { createMarkdownFileName, downloadTextFile } from "@/lib/download";
import {
  getBrowserInfo,
  getOperatingSystemInfo,
  getScreenSizeLabel
} from "@/lib/environment";
import {
  createReportFromDraft,
  generateMarkdownReport,
  inferBugDraft
} from "@/lib/reportGenerator";
import { evaluateReportReadiness } from "@/lib/reportQuality";
import {
  deleteStoredReport,
  getStoredReports,
  saveStoredReport
} from "@/lib/storage";
import type { BugReport, BugReportDraft } from "@/types/report";

const acceptedImageTypes = new Set(["image/png", "image/jpeg"]);

const initialDraft: BugReportDraft = {
  title: "",
  summary: "",
  reproductionSteps: "",
  expectedResult: "",
  actualResult: "",
  severity: "보통",
  pageUrl: "",
  browser: "",
  operatingSystem: "",
  screenSize: "",
  additionalNotes: "",
  ocrText: ""
};

interface OcrProgressMessage {
  status?: string;
  progress?: number;
}

export default function Page() {
  const [draft, setDraft] = useState<BugReportDraft>(initialDraft);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [reports, setReports] = useState<BugReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "error" }>();
  const isOcrRunningRef = useRef(false);

  const markdownReport = useMemo(
    () =>
      generateMarkdownReport({
        ...draft,
        id: "preview",
        createdAt: new Date(0).toISOString()
      }),
    [draft]
  );
  const reportReadiness = useMemo(
    () => evaluateReportReadiness(draft),
    [draft]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setReports(getStoredReports());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    function syncEnvironment() {
      setDraft((currentDraft) => ({
        ...currentDraft,
        browser:
          currentDraft.browser || getBrowserInfo(window.navigator.userAgent),
        operatingSystem:
          currentDraft.operatingSystem ||
          getOperatingSystemInfo(window.navigator.userAgent),
        screenSize: getScreenSizeLabel(window.innerWidth, window.innerHeight),
        pageUrl: currentDraft.pageUrl || window.location.href
      }));
    }

    syncEnvironment();
    window.addEventListener("resize", syncEnvironment);

    return () => window.removeEventListener("resize", syncEnvironment);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(undefined), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function updateDraft<Field extends keyof BugReportDraft>(
    field: Field,
    value: BugReportDraft[Field]
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
  }

  function handleFileSelect(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError("");
    setOcrError("");
    setSelectedFile(file);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
    void runOcr(file);
  }

  function removeImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError("");
    setOcrError("");
    setOcrProgress(0);
    setOcrStatus("");
  }

  async function runOcr(file = selectedFile) {
    if (!file || isOcrRunningRef.current) {
      return;
    }

    isOcrRunningRef.current = true;
    setIsOcrRunning(true);
    setOcrProgress(0);
    setOcrStatus("OCR 엔진 준비 중");
    setOcrError("");

    let worker: Awaited<
      ReturnType<typeof import("tesseract.js").createWorker>
    > | null = null;

    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker(["eng", "kor"], 1, {
        logger: (message: unknown) => {
          const progressMessage = message as OcrProgressMessage;
          setOcrStatus(progressMessage.status ?? "OCR 진행 중");
          if (typeof progressMessage.progress === "number") {
            setOcrProgress(Math.min(1, Math.max(0, progressMessage.progress)));
          }
        }
      });

      const result = await worker.recognize(file);
      const text = result.data.text.trim();

      if (!text) {
        setOcrError("OCR에서 읽을 수 있는 텍스트를 찾지 못했습니다.");
        updateDraft("ocrText", "");
        return;
      }

      setOcrProgress(1);
      setOcrStatus("텍스트 추출 완료");
      applyInferredDraft(text, false);
    } catch {
      setOcrError("OCR 처리 중 오류가 발생했습니다.");
    } finally {
      if (worker) {
        await worker.terminate().catch(() => undefined);
      }
      setIsOcrRunning(false);
      isOcrRunningRef.current = false;
    }
  }

  function applyInferredDraft(text = draft.ocrText, force = true) {
    const inferred = inferBugDraft(text);

    setDraft((currentDraft) => ({
      ...currentDraft,
      ocrText: text,
      title: force || !currentDraft.title ? inferred.title : currentDraft.title,
      summary:
        force || !currentDraft.summary
          ? inferred.summary
          : currentDraft.summary,
      actualResult:
        force || !currentDraft.actualResult
          ? inferred.actualResult
          : currentDraft.actualResult,
      severity: inferred.severity
    }));
  }

  async function copyMarkdown() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdownReport);
      } else {
        fallbackCopy(markdownReport);
      }
      setCopied(true);
      setToast({ message: "Markdown 리포트를 복사했습니다.", type: "ok" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setToast({ message: "복사에 실패했습니다.", type: "error" });
    }
  }

  function saveReport() {
    const report = createReportFromDraft(draft);
    const nextReports = saveStoredReport(report);
    setReports(nextReports);
    setActiveReportId(report.id);
    setToast({ message: "최근 리포트에 저장했습니다.", type: "ok" });
  }

  function downloadMarkdown() {
    const fileName = createMarkdownFileName(draft.title);
    downloadTextFile(markdownReport, fileName);
    setToast({ message: `${fileName} 파일로 저장했습니다.`, type: "ok" });
  }

  function selectReport(report: BugReport) {
    setDraft({
      title: report.title,
      summary: report.summary,
      reproductionSteps: report.reproductionSteps,
      expectedResult: report.expectedResult,
      actualResult: report.actualResult,
      severity: report.severity,
      pageUrl: report.pageUrl,
      browser: report.browser,
      operatingSystem: report.operatingSystem,
      screenSize: report.screenSize,
      additionalNotes: report.additionalNotes,
      ocrText: report.ocrText
    });
    setActiveReportId(report.id);
    setToast({ message: "저장된 리포트를 불러왔습니다.", type: "ok" });
  }

  function deleteReport(reportId: string) {
    const nextReports = deleteStoredReport(reportId);
    setReports(nextReports);
    if (activeReportId === reportId) {
      setActiveReportId(undefined);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-lg border border-border bg-card px-5 py-6 shadow-2xl shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary),var(--destructive))]" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Image src="/BugSnap/logo.png" alt="" width={20} height={20} className="object-contain" priority unoptimized />
              BugSnap
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              오류 화면을 업로드하면 버그 리포트 초안으로 정리합니다.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              OCR, 환경 정보 자동 채움, 심각도 추론, GitHub Issue Markdown 생성까지
              모두 로컬 브라우저에서 동작하는 MVP입니다.
            </p>
          </div>
          <div className="grid gap-2 rounded-md border border-border bg-background/60 p-3 font-mono text-xs text-muted-foreground">
            <span>DB: localStorage</span>
            <span>OCR: tesseract.js</span>
            <span>API: paid external API 없음</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <ImageUploader
          file={selectedFile}
          previewUrl={previewUrl}
          disabled={isOcrRunning}
          error={uploadError}
          onFileSelect={handleFileSelect}
          onRemove={removeImage}
        />

        <div className="grid gap-6">
          <OcrPanel
            text={draft.ocrText}
            isRunning={isOcrRunning}
            progress={ocrProgress}
            status={ocrStatus}
            error={ocrError}
            canRunOcr={Boolean(selectedFile)}
            onTextChange={(value) => updateDraft("ocrText", value)}
            onRunOcr={() => void runOcr()}
            onApplyDraft={() => applyInferredDraft()}
          />
          <BugForm draft={draft} onChange={updateDraft} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <MarkdownPreview
          markdown={markdownReport}
          readiness={reportReadiness}
          copied={copied}
          onCopy={() => void copyMarkdown()}
          onDownload={downloadMarkdown}
          onSave={saveReport}
        />
        <RecentReports
          reports={reports}
          activeReportId={activeReportId}
          onSelect={selectReport}
          onDelete={deleteReport}
        />
      </div>

      {toast ? (
        <div
          className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-md border px-4 py-3 text-sm shadow-2xl shadow-black/30 ${
            toast.type === "ok"
              ? "border-primary/40 bg-card text-foreground"
              : "border-destructive/50 bg-card text-destructive"
          }`}
          role="status"
        >
          {toast.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          {toast.message}
        </div>
      ) : null}
    </main>
  );
}

function validateImageFile(file: File): string {
  if (!acceptedImageTypes.has(file.type)) {
    return "PNG, JPG, JPEG 이미지 파일만 업로드할 수 있습니다.";
  }

  return "";
}

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
