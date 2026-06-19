import { describe, expect, it } from "vitest";
import { evaluateReportReadiness } from "@/lib/reportQuality";
import type { BugReportDraft } from "@/types/report";

const completeDraft: BugReportDraft = {
  title: "결제 페이지 500 오류",
  summary: "결제 버튼을 누르면 서버 오류 화면이 표시됩니다.",
  reproductionSteps: "결제 페이지 접속\n결제 버튼 클릭\n오류 화면 확인",
  expectedResult: "결제가 완료되어야 합니다.",
  actualResult: "500 Internal Server Error 화면이 표시됩니다.",
  severity: "높음",
  pageUrl: "https://example.com/checkout",
  browser: "Chrome 126",
  operatingSystem: "macOS",
  screenSize: "1440 x 900",
  additionalNotes: "",
  ocrText: "500 Internal Server Error"
};

describe("evaluateReportReadiness", () => {
  it("marks detailed reports as ready", () => {
    const readiness = evaluateReportReadiness(completeDraft);

    expect(readiness.score).toBe(100);
    expect(readiness.status).toBe("제출 준비 완료");
    expect(readiness.missingItems).toEqual([]);
  });

  it("flags missing reproduction and environment details", () => {
    const readiness = evaluateReportReadiness({
      ...completeDraft,
      reproductionSteps: "결제 페이지 접속",
      expectedResult: "",
      browser: "",
      operatingSystem: "",
      screenSize: "",
      pageUrl: ""
    });

    expect(readiness.score).toBeLessThan(70);
    expect(readiness.status).toBe("검토 필요");
    expect(readiness.missingItems).toContain("재현 절차를 2단계 이상 적어주세요.");
    expect(readiness.missingItems).toContain("예상 결과를 적어주세요.");
    expect(readiness.missingItems).toContain("환경 정보가 부족합니다.");
  });

  it("marks nearly empty reports as insufficient", () => {
    const readiness = evaluateReportReadiness({
      ...completeDraft,
      title: "",
      summary: "",
      reproductionSteps: "",
      expectedResult: "",
      actualResult: "",
      ocrText: ""
    });

    expect(readiness.score).toBeLessThan(40);
    expect(readiness.status).toBe("준비 부족");
  });
});
