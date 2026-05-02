import Link from "next/link";

export default function AdminHubPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs tracking-widest text-gray-500">ADMIN</div>
        <h1 className="text-2xl font-bold">管理画面トップ</h1>
        <p className="text-sm text-gray-600 mt-1">採用ファネルとマネジメントの2機能を切り替えて使用します。</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/recruit"
          className="block bg-white border border-quad-line rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-xs tracking-widest text-gray-500 mb-2">SECTION 1</div>
          <h2 className="text-xl font-bold mb-2">採用 →</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            応募 / 1次 / 2次 / 最終 / 合格 / 不採用 のステージ別管理。診断結果と履歴書を統合し、面接の深掘り質問提案、採用判定までを一気通貫。
          </p>
        </Link>
        <Link
          href="/admin/manage"
          className="block bg-white border border-quad-line rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-xs tracking-widest text-gray-500 mb-2">SECTION 2</div>
          <h2 className="text-xl font-bold mb-2">マネジメント →</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            採用済み社員の継続支援。マネジメントガイド、定期再診断、1年後比較、配置最適化提案。
          </p>
        </Link>
      </section>
    </div>
  );
}
