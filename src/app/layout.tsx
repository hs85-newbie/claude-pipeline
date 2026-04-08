import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Claude Pipeline — 이슈 하나로 코드 수정부터 PR 머지까지",
  description:
    "GitHub + Claude = 자율 개발 파이프라인. 이슈만 남기면 AI가 코드 분석, 수정, PR 생성까지 자동으로.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(0 0% 8%)",
              border: "1px solid hsl(0 0% 15%)",
              color: "hsl(0 0% 90%)",
            },
          }}
        />
      </body>
    </html>
  );
}
