import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <div className="text-xs tracking-widest text-gray-500">QUAD MIND HR PLATFORM</div>
        <h1 className="text-3xl font-bold leading-tight">
          1本の理論で、採用→配置→マネジメントを貫通する
        </h1>
        <p className="text-gray-700 max-w-3xl leading-relaxed">
          クアッドマインド理論(A/B/C/D 4軸)をベースに、応募から定着まで「同じ言語」で人を捉えるHRプラットフォームのデモ。
          採用ファネル(応募 → 選考 → 合格)とマネジメント(採用後の継続支援)をひとつの画面で繋ぎます。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/recruit"
          className="block bg-white border border-quad-line rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-xs tracking-widest text-gray-500 mb-2">SECTION 1</div>
          <h2 className="text-xl font-bold mb-2">採用ダッシュボード →</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            応募 / 1次 / 2次 / 最終 / 合格 のステージ別に応募者を管理。診断結果と履歴書情報を統合し、面接深掘り質問の自動提案、採用判定までを一気通貫で。
          </p>
        </Link>
        <Link
          href="/admin/manage"
          className="block bg-white border border-quad-line rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-xs tracking-widest text-gray-500 mb-2">SECTION 2</div>
          <h2 className="text-xl font-bold mb-2">マネジメント →</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            採用後の社員管理。マネジメントガイド、定期再診断、1年後比較、配置最適化提案。同じ人物を時系列で追跡し、定着率と成長を支援。
          </p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-quad-paper border border-quad-line rounded p-4">
          <div className="text-xs tracking-widest text-gray-500 mb-1">候補者向け</div>
          <h3 className="font-bold mb-2">応募フォーム</h3>
          <p className="text-xs text-gray-600 mb-3">候補者は公開リンクからプロフィール・経歴・診断を入力します。</p>
          <Link href="/apply/demo" className="text-quad-d text-sm font-semibold hover:underline">
            プレビュー →
          </Link>
        </div>
        <div className="bg-quad-paper border border-quad-line rounded p-4">
          <div className="text-xs tracking-widest text-gray-500 mb-1">管理者向け</div>
          <h3 className="font-bold mb-2">設定</h3>
          <p className="text-xs text-gray-600 mb-3">入力モード(質問形式/履歴書/併用)、選考段階のラベル変更。</p>
          <Link href="/admin/settings" className="text-quad-d text-sm font-semibold hover:underline">
            設定を開く →
          </Link>
        </div>
        <div className="bg-amber-50 border border-quad-b/40 rounded p-4">
          <div className="text-xs tracking-widest text-gray-500 mb-1">デモの見方</div>
          <p className="text-xs text-gray-700 leading-relaxed">
            完全な機能網羅ではなく実運用フローの可視化を優先。本番では認証・監査ログ・OCR精緻化が入ります。
          </p>
        </div>
      </section>
    </div>
  );
}
