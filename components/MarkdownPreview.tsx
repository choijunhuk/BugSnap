"use client";

import { Clipboard, Download, Save } from "lucide-react";

interface MarkdownPreviewProps {
  markdown: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
}

export function MarkdownPreview({
  markdown,
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

      <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground">
        {markdown}
      </pre>
    </section>
  );
}
