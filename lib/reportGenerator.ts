import type { BugReport, BugReportDraft, Severity } from "@/types/report";

const DEFAULT_TEXT = {
  title: "스크린샷 기반 버그 리포트",
  summary: "업로드한 스크린샷과 입력 내용을 바탕으로 정리한 버그입니다.",
  reproductionStep: "재현 절차를 입력해주세요.",
  expectedResult: "정상적으로 기대한 동작을 입력해주세요.",
  actualResult: "실제로 발생한 문제를 입력해주세요.",
  ocrText: "OCR 또는 오류 화면 텍스트를 입력해주세요.",
  notes: "추가 메모가 없습니다.",
  environment: "정보 없음"
} as const;

const severityMatchers: Array<{ severity: Severity; pattern: RegExp }> = [
  {
    severity: "치명적",
    pattern: /\b(fatal|critical|crash|data loss|outage|panic)\b/i
  },
  {
    severity: "높음",
    pattern:
      /\b(500|internal server error|exception|cannot read|undefined|null|timeout|network error|failed)\b/i
  },
  {
    severity: "높음",
    pattern: /\b(typeerror|referenceerror)\b/i
  },
  {
    severity: "보통",
    pattern: /\b(validation|invalid|required|missing|잘못된|필수)\b/i
  }
];

function firstMeaningfulLine(text: string): string {
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}

export function inferSeverity(text: string): Severity {
  const normalized = text.trim();

  if (
    /\b(validation|invalid|required|missing|잘못된|필수)\b/i.test(normalized) &&
    !/\b(500|internal server error|exception|typeerror|referenceerror|cannot read|undefined|null|timeout|network error)\b/i.test(
      normalized
    )
  ) {
    return "보통";
  }

  for (const matcher of severityMatchers) {
    if (matcher.pattern.test(normalized)) {
      return matcher.severity;
    }
  }

  return normalized ? "보통" : "낮음";
}

export function inferTitle(text: string): string {
  const line = firstMeaningfulLine(text);

  if (/500|internal server error/i.test(text)) {
    return "500 Internal Server Error 발생";
  }

  if (/typeerror/i.test(text)) {
    return "TypeError 발생";
  }

  if (/referenceerror/i.test(text)) {
    return "ReferenceError 발생";
  }

  if (/validation|invalid|required|missing|잘못된|필수/i.test(text)) {
    return "입력값 검증 오류 발생";
  }

  if (!line) {
    return DEFAULT_TEXT.title;
  }

  return `${truncate(line.replace(/\s+/g, " "), 72)} 발생`;
}

export function inferBugDraft(ocrText: string): BugReportDraft {
  const cleanText = ocrText.trim();
  const title = inferTitle(cleanText);
  const severity = inferSeverity(cleanText);

  return {
    title,
    summary: cleanText
      ? `${title.replace(/ 발생$/, "")} 문제가 화면에서 확인되었습니다.`
      : DEFAULT_TEXT.summary,
    reproductionSteps: "",
    expectedResult: "",
    actualResult: cleanText || "",
    severity,
    pageUrl: "",
    browser: "",
    operatingSystem: "",
    screenSize: "",
    additionalNotes: "",
    ocrText: cleanText
  };
}

export function normalizeReproductionSteps(value: string): string[] {
  const steps = value
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^[-*]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .trim()
    )
    .filter(Boolean);

  return steps.length > 0 ? steps : [DEFAULT_TEXT.reproductionStep];
}

function fallback(value: string, placeholder: string): string {
  return value.trim() || placeholder;
}

export function generateMarkdownReport(report: BugReport): string {
  const steps = normalizeReproductionSteps(report.reproductionSteps)
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return `# ${fallback(report.title, DEFAULT_TEXT.title)}

## 요약

${fallback(report.summary, DEFAULT_TEXT.summary)}

## 재현 절차

${steps}

## 예상 결과

${fallback(report.expectedResult, DEFAULT_TEXT.expectedResult)}

## 실제 결과

${fallback(report.actualResult, DEFAULT_TEXT.actualResult)}

## 오류 메시지 / 화면 텍스트

${fallback(report.ocrText, DEFAULT_TEXT.ocrText)}

## 심각도

${report.severity}

## 환경 정보

* 브라우저: ${fallback(report.browser, DEFAULT_TEXT.environment)}
* 운영체제: ${fallback(report.operatingSystem, DEFAULT_TEXT.environment)}
* 화면 크기: ${fallback(report.screenSize, DEFAULT_TEXT.environment)}
* 발생 URL: ${fallback(report.pageUrl, DEFAULT_TEXT.environment)}

## 추가 메모

${fallback(report.additionalNotes, DEFAULT_TEXT.notes)}`;
}

export function createReportFromDraft(draft: BugReportDraft): BugReport {
  return {
    ...draft,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `report-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
}
