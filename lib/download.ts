export function createMarkdownFileName(
  title: string,
  date: Date = new Date()
): string {
  const dateStamp = date.toISOString().slice(0, 10);
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `bugsnap-${dateStamp}-${slug || "report"}.md`;
}

export function downloadTextFile(
  contents: string,
  fileName: string,
  documentRef: Document = document
) {
  const blob = new Blob([contents], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  documentRef.body.appendChild(anchor);
  anchor.click();
  documentRef.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
