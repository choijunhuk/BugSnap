import { describe, expect, it } from "vitest";
import {
  generateMarkdownReport,
  inferBugDraft,
  normalizeReproductionSteps
} from "@/lib/reportGenerator";
import type { BugReport } from "@/types/report";

describe("inferBugDraft", () => {
  it("infers high severity and a server-error title from OCR text", () => {
    const draft = inferBugDraft(
      "500 Internal Server Error\nTypeError: Cannot read properties of undefined"
    );

    expect(draft.severity).toBe("높음");
    expect(draft.title).toBe("500 Internal Server Error 발생");
    expect(draft.actualResult).toContain("500 Internal Server Error");
  });

  it("keeps validation errors at normal severity", () => {
    const draft = inferBugDraft("Validation failed: email is required");

    expect(draft.severity).toBe("보통");
    expect(draft.title).toBe("입력값 검증 오류 발생");
  });
});

describe("normalizeReproductionSteps", () => {
  it("converts bullets and existing numbers to ordered Markdown steps", () => {
    const steps = normalizeReproductionSteps(
      "- 로그인한다\n2. 설정 페이지로 이동한다\n오류 버튼을 누른다"
    );

    expect(steps).toEqual([
      "로그인한다",
      "설정 페이지로 이동한다",
      "오류 버튼을 누른다"
    ]);
  });

  it("returns a single placeholder step for empty input", () => {
    expect(normalizeReproductionSteps("")).toEqual([
      "재현 절차를 입력해주세요."
    ]);
  });
});

describe("generateMarkdownReport", () => {
  it("creates the requested GitHub Issue Markdown structure", () => {
    const report: BugReport = {
      id: "report-1",
      createdAt: "2026-06-20T10:00:00.000Z",
      title: "결제 페이지 500 오류",
      summary: "결제 시 서버 오류가 표시됩니다.",
      reproductionSteps: "결제 페이지 접속\n결제 버튼 클릭",
      expectedResult: "결제가 완료되어야 합니다.",
      actualResult: "500 오류 화면이 표시됩니다.",
      severity: "높음",
      pageUrl: "https://example.com/pay",
      browser: "Chrome 126",
      operatingSystem: "macOS",
      screenSize: "1440 x 900",
      additionalNotes: "특정 계정에서 반복 발생",
      ocrText: "500 Internal Server Error"
    };

    expect(generateMarkdownReport(report)).toBe(`# 결제 페이지 500 오류

## 요약

결제 시 서버 오류가 표시됩니다.

## 재현 절차

1. 결제 페이지 접속
2. 결제 버튼 클릭

## 예상 결과

결제가 완료되어야 합니다.

## 실제 결과

500 오류 화면이 표시됩니다.

## 오류 메시지 / 화면 텍스트

500 Internal Server Error

## 심각도

높음

## 환경 정보

* 브라우저: Chrome 126
* 운영체제: macOS
* 화면 크기: 1440 x 900
* 발생 URL: https://example.com/pay

## 추가 메모

특정 계정에서 반복 발생`);
  });
});
