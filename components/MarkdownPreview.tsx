"use client";

import { Clipboard, Download, Save } from "lucide-react";
import type { ReportReadiness } from "@/lib/reportQuality";

interface MarkdownPreviewProps {
  markdown: string;
  readiness: ReportReadiness;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
}

export function MarkdownPreview({
  markdown,
  readiness,
  copied,
  onCopy,
  onDownload,
  onSave
}: MarkdownPreviewProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            GitHub Issue Markdown
          </p>
          <h2 className="mt-2 text-xl font-semibold">리포트 미리보기</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Clipboard className="h-4 w-4" />
            {copied ? "복사됨" : "Markdown 복사"}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            <Download className="h-4 w-4" />
            .md 다운로드
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:border-secondary hover:text-secondary"
          >
            <Save className="h-4 w-4" />
            최근 리포트 저장
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-md border border-border bg-background/70 p-4 sm:grid-cols-[auto_1fr]">
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-primary/30 bg-primary/10 font-mono text-lg font-semibold text-primary">
          {readiness.score}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              리포트 완성도
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {readiness.status}
            </span>
          </div>
          {readiness.missingItems.length > 0 ? (
            <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
              {readiness.missingItems.slice(0, 3).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              GitHub Issue로 옮기기 좋은 수준으로 핵심 정보가 채워졌습니다.
            </p>
          )}
        </div>
      </div>

      <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground">
        {markdown}
      </pre>
    </section>
  );
}
