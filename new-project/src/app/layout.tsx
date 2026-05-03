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
      <body className="min-h-screen font-sans antialiased text-slate-800">
        <div className="h-1 bg-brand-gradient" />
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-20 shadow-soft">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-brand-gradient grid place-items-center text-white font-bold text-sm shadow-sm">
                Q
              </div>
              <div>
                <div className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                  Quad Mind
                </div>
                <div className="text-sm font-bold leading-tight text-slate-900">
                  HR Platform · Demo v1
                </div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <NavLink href="/admin/recruit">採用</NavLink>
              <NavLink href="/admin/manage">マネジメント</NavLink>
              <NavLink href="/admin/settings">設定</NavLink>
              <span className="mx-2 h-5 w-px bg-slate-200" />
              <Link
                href="/apply/demo"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                応募フォーム ↗
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-10 mt-10 border-t border-slate-200/80">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © Quad Mind · Eisel Inc. — <span className="text-slate-400">Demo build</span>
            </div>
            <div className="text-slate-400">
              本番では認証 / 監査ログ / 暗号化 / OCR精緻化が追加されます
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-slate-700 font-medium hover:bg-brand-50 hover:text-brand-700 transition-colors"
    >
      {children}
    </Link>
  );
}
