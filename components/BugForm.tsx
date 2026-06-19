"use client";

import type { BugReportDraft, Severity } from "@/types/report";

interface BugFormProps {
  draft: BugReportDraft;
  onChange: <Field extends keyof BugReportDraft>(
    field: Field,
    value: BugReportDraft[Field]
  ) => void;
}

const severities: Severity[] = ["낮음", "보통", "높음", "치명적"];

export function BugForm({ draft, onChange }: BugFormProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Report fields
        </p>
        <h2 className="mt-2 text-xl font-semibold">버그 정보</h2>
      </div>

      <div className="grid gap-4">
        <TextInput
          label="버그 제목"
          value={draft.title}
          placeholder="예: 결제 페이지 500 오류"
          onChange={(value) => onChange("title", value)}
        />
        <TextArea
          label="버그 요약"
          value={draft.summary}
          placeholder="문제를 한두 문장으로 정리하세요."
          rows={3}
          onChange={(value) => onChange("summary", value)}
        />
        <TextArea
          label="재현 절차"
          value={draft.reproductionSteps}
          placeholder={"1. 문제가 발생한 페이지로 이동\n2. 특정 버튼을 클릭\n3. 오류 화면 확인"}
          rows={4}
          onChange={(value) => onChange("reproductionSteps", value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            label="예상 결과"
            value={draft.expectedResult}
            placeholder="정상적으로 기대한 동작"
            rows={4}
            onChange={(value) => onChange("expectedResult", value)}
          />
          <TextArea
            label="실제 결과"
            value={draft.actualResult}
            placeholder="실제로 발생한 문제"
            rows={4}
            onChange={(value) => onChange("actualResult", value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            심각도
            <select
              value={draft.severity}
              onChange={(event) =>
                onChange("severity", event.target.value as Severity)
              }
              className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>
          <TextInput
            label="발생 페이지 또는 URL"
            value={draft.pageUrl}
            placeholder="https://example.com/path"
            onChange={(value) => onChange("pageUrl", value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput
            label="브라우저 정보"
            value={draft.browser}
            onChange={(value) => onChange("browser", value)}
          />
          <TextInput
            label="운영체제 정보"
            value={draft.operatingSystem}
            onChange={(value) => onChange("operatingSystem", value)}
          />
          <TextInput
            label="화면 크기"
            value={draft.screenSize}
            onChange={(value) => onChange("screenSize", value)}
          />
        </div>
        <TextArea
          label="추가 메모"
          value={draft.additionalNotes}
          placeholder="관련 계정, 시간, 로그 위치 등 추가 단서를 적으세요."
          rows={4}
          onChange={(value) => onChange("additionalNotes", value)}
        />
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

function TextInput({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  rows,
  onChange
}: FieldProps & { rows: number }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y rounded-md border border-input bg-background px-3 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}
