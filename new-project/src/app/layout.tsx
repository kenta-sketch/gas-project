import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quad Mind Demo",
  description: "クアッドマインド理論ベース HRプラットフォーム デモ (v1)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-quad-line bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <Link href="/admin" className="block">
              <div className="text-xs tracking-widest text-gray-500">QUAD MIND</div>
              <div className="text-base font-bold leading-tight">HR Platform / Demo v1</div>
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/admin/recruit"
                className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700"
              >
                採用
              </Link>
              <Link
                href="/admin/manage"
                className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700"
              >
                マネジメント
              </Link>
              <Link
                href="/admin/settings"
                className="px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700"
              >
                設定
              </Link>
              <span className="mx-2 h-5 w-px bg-quad-line" />
              <Link
                href="/apply/demo"
                className="px-3 py-1.5 rounded bg-quad-paper border border-quad-line text-gray-700"
              >
                応募フォーム(公開)
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-gray-400 border-t border-quad-line mt-8">
          Demo build · 本番では認証(SSO/RBAC)・監査ログ・暗号化・履歴書OCR(精緻版)が追加されます
        </footer>
      </body>
    </html>
  );
}
