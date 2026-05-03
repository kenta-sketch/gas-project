import Link from "next/link";

export default function AdminHubPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">ADMIN</div>
        <h1 className="text-3xl font-bold text-slate-900">管理画面</h1>
        <p className="text-sm text-slate-600 mt-1">採用ファネルとマネジメントの2機能を切り替えて使用します。</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/recruit"
          className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="h-1 bg-brand-gradient" />
          <div className="p-6">
            <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-2">SECTION 1</div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-700">採用 →</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              応募 / 1次 / 2次 / 最終 / 合格 / 不採用 のステージ別管理。診断結果と履歴書を統合し、面接の深掘り質問提案、採用判定までを一気通貫。
            </p>
          </div>
        </Link>
        <Link
          href="/admin/manage"
          className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="p-6">
            <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-2">SECTION 2</div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700">マネジメント →</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              採用済み社員の継続支援。マネジメントガイド・定期再診断・1年後比較・配置最適化提案。
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
