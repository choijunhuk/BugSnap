import { normalizeReproductionSteps } from "@/lib/reportGenerator";
import type { BugReportDraft } from "@/types/report";

export type ReadinessStatus = "준비 부족" | "검토 필요" | "제출 준비 완료";

export interface ReportReadiness {
  score: number;
  status: ReadinessStatus;
  missingItems: string[];
}

interface Check {
  points: number;
  message: string;
  passes: boolean;
}

export function evaluateReportReadiness(
  draft: BugReportDraft
): ReportReadiness {
  const reproductionSteps = normalizeReproductionSteps(draft.reproductionSteps);
  const hasRealSteps =
    draft.reproductionSteps.trim().length > 0 && reproductionSteps.length >= 2;
  const hasEnvironment =
    Boolean(draft.browser.trim()) &&
    Boolean(draft.operatingSystem.trim()) &&
    Boolean(draft.screenSize.trim()) &&
    Boolean(draft.pageUrl.trim());

  const checks: Check[] = [
    {
      points: 15,
      message: "버그 제목을 적어주세요.",
      passes: Boolean(draft.title.trim())
    },
    {
      points: 15,
      message: "요약을 한 문장 이상 적어주세요.",
      passes: draft.summary.trim().length >= 12
    },
    {
      points: 20,
      message: "재현 절차를 2단계 이상 적어주세요.",
      passes: hasRealSteps
    },
    {
      points: 15,
      message: "예상 결과를 적어주세요.",
      passes: Boolean(draft.expectedResult.trim())
    },
    {
      points: 15,
      message: "실제 결과를 적어주세요.",
      passes: Boolean(draft.actualResult.trim())
    },
    {
      points: 10,
      message: "오류 메시지나 화면 텍스트를 적어주세요.",
      passes: Boolean(draft.ocrText.trim())
    },
    {
      points: 10,
      message: "환경 정보가 부족합니다.",
      passes: hasEnvironment
    }
  ];

  const score = checks.reduce(
    (total, check) => total + (check.passes ? check.points : 0),
    0
  );
  const missingItems = checks
    .filter((check) => !check.passes)
    .map((check) => check.message);

  return {
    score,
    status: getReadinessStatus(score),
    missingItems
  };
}

function getReadinessStatus(score: number): ReadinessStatus {
  if (score >= 85) {
    return "제출 준비 완료";
  }

  if (score >= 40) {
    return "검토 필요";
  }

  return "준비 부족";
}
