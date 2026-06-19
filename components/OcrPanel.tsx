"use client";

import { Loader2, ScanText, Wand2 } from "lucide-react";

interface OcrPanelProps {
  text: string;
  isRunning: boolean;
  progress: number;
  status: string;
  error?: string;
  canRunOcr: boolean;
  onTextChange: (value: string) => void;
  onRunOcr: () => void;
  onApplyDraft: () => void;
}

export function OcrPanel({
  text,
  isRunning,
  progress,
  status,
  error,
  canRunOcr,
  onTextChange,
  onRunOcr,
  onApplyDraft
}: OcrPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            OCR console
          </p>
          <h2 className="mt-2 text-xl font-semibold">화면 텍스트</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRunOcr}
            disabled={!canRunOcr || isRunning}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanText className="h-4 w-4" />
            )}
            OCR 실행
          </button>
          <button
            type="button"
            onClick={onApplyDraft}
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            자동 채우기
          </button>
        </div>
      </div>

      {isRunning ? (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-primary">{status || "OCR 준비 중"}</span>
            <span className="font-mono text-primary">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error} 텍스트를 직접 입력해주세요.
        </p>
      ) : null}

      <textarea
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        rows={8}
        placeholder="OCR 결과가 여기에 표시됩니다. 실패하거나 내용이 부족하면 직접 입력하세요."
        className="min-h-48 w-full resize-y rounded-md border border-input bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground"
      />
    </section>
  );
}
