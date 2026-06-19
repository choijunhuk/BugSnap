import { describe, expect, it } from "vitest";
import { createMarkdownFileName } from "@/lib/download";

describe("createMarkdownFileName", () => {
  it("creates a safe Markdown filename from a Korean bug title", () => {
    const fileName = createMarkdownFileName(
      "결제 페이지 500 오류!",
      new Date("2026-06-20T09:30:00.000Z")
    );

    expect(fileName).toBe("bugsnap-2026-06-20-결제-페이지-500-오류.md");
  });

  it("falls back when the title has no usable filename characters", () => {
    const fileName = createMarkdownFileName(
      "!!!",
      new Date("2026-06-20T09:30:00.000Z")
    );

    expect(fileName).toBe("bugsnap-2026-06-20-report.md");
  });
});
