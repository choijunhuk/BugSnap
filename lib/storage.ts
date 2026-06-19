import type { BugReport } from "@/types/report";

const STORAGE_KEY = "bugsnap:recent-reports";
const MAX_REPORTS = 10;

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function parseReports(rawValue: string | null): BugReport[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(isBugReport) : [];
  } catch {
    return [];
  }
}

function isBugReport(value: unknown): value is BugReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof BugReport, unknown>>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    typeof candidate.reproductionSteps === "string" &&
    typeof candidate.expectedResult === "string" &&
    typeof candidate.actualResult === "string" &&
    typeof candidate.severity === "string" &&
    typeof candidate.pageUrl === "string" &&
    typeof candidate.browser === "string" &&
    typeof candidate.operatingSystem === "string" &&
    typeof candidate.screenSize === "string" &&
    typeof candidate.additionalNotes === "string" &&
    typeof candidate.ocrText === "string"
  );
}

export function getStoredReports(storage?: Storage): BugReport[] {
  const targetStorage = resolveStorage(storage);

  if (!targetStorage) {
    return [];
  }

  return parseReports(targetStorage.getItem(STORAGE_KEY));
}

export function saveStoredReport(
  report: BugReport,
  storage?: Storage
): BugReport[] {
  const targetStorage = resolveStorage(storage);

  if (!targetStorage) {
    return [];
  }

  const nextReports = [
    report,
    ...getStoredReports(targetStorage).filter((item) => item.id !== report.id)
  ]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
    .slice(0, MAX_REPORTS);

  targetStorage.setItem(STORAGE_KEY, JSON.stringify(nextReports));
  return nextReports;
}

export function deleteStoredReport(
  reportId: string,
  storage?: Storage
): BugReport[] {
  const targetStorage = resolveStorage(storage);

  if (!targetStorage) {
    return [];
  }

  const nextReports = getStoredReports(targetStorage).filter(
    (report) => report.id !== reportId
  );
  targetStorage.setItem(STORAGE_KEY, JSON.stringify(nextReports));
  return nextReports;
}
