import { describe, expect, it } from "vitest";
import {
  deleteStoredReport,
  getStoredReports,
  saveStoredReport
} from "@/lib/storage";
import type { BugReport } from "@/types/report";

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

const baseReport: BugReport = {
  id: "report-1",
  createdAt: "2026-06-20T10:00:00.000Z",
  title: "500 오류",
  summary: "서버 오류가 표시됩니다.",
  reproductionSteps: "페이지 접속",
  expectedResult: "정상 화면",
  actualResult: "500 오류",
  severity: "높음",
  pageUrl: "/checkout",
  browser: "Chrome",
  operatingSystem: "macOS",
  screenSize: "1440 x 900",
  additionalNotes: "",
  ocrText: "500 Internal Server Error"
};

describe("storage helpers", () => {
  it("returns an empty list when browser storage is unavailable", () => {
    expect(getStoredReports()).toEqual([]);
  });

  it("saves newest reports first and limits the list", () => {
    const storage = new MemoryStorage();

    for (let index = 0; index < 12; index += 1) {
      saveStoredReport(
        {
          ...baseReport,
          id: `report-${index}`,
          createdAt: `2026-06-20T10:00:${String(index).padStart(2, "0")}.000Z`
        },
        storage
      );
    }

    const reports = getStoredReports(storage);
    expect(reports).toHaveLength(10);
    expect(reports[0]?.id).toBe("report-11");
    expect(reports[9]?.id).toBe("report-2");
  });

  it("deletes a report by id", () => {
    const storage = new MemoryStorage();
    saveStoredReport(baseReport, storage);

    expect(deleteStoredReport("report-1", storage)).toEqual([]);
  });
});
