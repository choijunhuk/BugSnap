"use client";

import { AlertTriangle, Clock3, Trash2 } from "lucide-react";
import type { BugReport } from "@/types/report";

interface RecentReportsProps {
  reports: BugReport[];
  activeReportId?: string;
  onSelect: (report: BugReport) => void;
  onDelete: (reportId: string) => void;
}

export function RecentReports({
  reports,
  activeReportId,
  onSelect,
  onDelete
}: RecentReportsProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Local archive
          </p>
          <h2 className="mt-2 text-xl font-semibold">최근 리포트</h2>
        </div>
        <span className="rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {reports.length}/10
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-background/60 p-5 text-sm text-muted-foreground">
          저장된 리포트가 없습니다. Markdown 미리보기에서 저장하면 여기에 표시됩니다.
        </div>
      ) : (
        <ul className="grid gap-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className={`rounded-md border p-3 transition ${
                report.id === activeReportId
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(report)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {report.title || "제목 없는 리포트"}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {report.severity}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(report.createdAt)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(report.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label={`${report.title} 삭제`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
