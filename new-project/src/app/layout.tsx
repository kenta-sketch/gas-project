import type { Metadata } from "next";
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
        <header className="border-b border-quad-line bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs tracking-widest text-gray-500">QUAD MIND</div>
              <div className="text-lg font-bold">採用フェーズ デモ v1</div>
            </div>
            <div className="text-xs text-gray-400">
              Powered by Quad Mind Theory · Eisel Inc.
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-8 text-xs text-gray-400">
          Demo build · 本番では認証/監査ログ/暗号化が追加されます
        </footer>
      </body>
    </html>
  );
}
