"use client";

import { ImageIcon, RefreshCw, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  file: File | null;
  previewUrl: string | null;
  disabled?: boolean;
  error?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export function ImageUploader({
  file,
  previewUrl,
  disabled = false,
  error,
  onFileSelect,
  onRemove
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const nextFile = files?.[0];
    if (nextFile) {
      onFileSelect(nextFile);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Screenshot intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            스크린샷 업로드
          </h2>
        </div>
        {previewUrl ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground transition hover:border-destructive hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="이미지 제거"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-background/60"
        }`}
      >
        {previewUrl ? (
          <div className="w-full">
            {/* Blob URLs are local previews, so Next image optimization is not useful here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="업로드한 오류 화면 미리보기"
              className="max-h-[34rem] w-full rounded-md border border-border object-contain"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                {file?.name}
              </span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                다시 업로드
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted text-primary">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="mt-5 text-base font-medium text-foreground">
              PNG, JPG, JPEG 파일을 끌어다 놓으세요.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              OCR은 브라우저에서 실행되며, 이미지는 서버로 업로드되지 않습니다.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              파일 선택
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error ? (
        <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
