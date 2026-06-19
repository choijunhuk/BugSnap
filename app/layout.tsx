import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BugSnap",
  description: "스크린샷을 GitHub Issue용 버그 리포트 초안으로 정리하는 로컬 MVP",
  icons: {
    icon: [{ url: "/BugSnap/favicon.png", type: "image/png" }],
    apple: [{ url: "/BugSnap/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
