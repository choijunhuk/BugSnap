export type Severity = "낮음" | "보통" | "높음" | "치명적";

export interface BugReport {
  id: string;
  createdAt: string;
  title: string;
  summary: string;
  reproductionSteps: string;
  expectedResult: string;
  actualResult: string;
  severity: Severity;
  pageUrl: string;
  browser: string;
  operatingSystem: string;
  screenSize: string;
  additionalNotes: string;
  ocrText: string;
}

export type BugReportDraft = Omit<BugReport, "id" | "createdAt">;

export interface StoredReportPreview {
  id: string;
  title: string;
  severity: Severity;
  createdAt: string;
}
