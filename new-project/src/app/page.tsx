import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-hero-gradient p-10 shadow-soft">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-quad-c/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="text-[10px] tracking-[0.25em] text-brand-700 uppercase mb-3 font-semibold">
            Quad Mind HR Platform
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 max-w-3xl">
            1本の理論で、<span className="bg-brand-gradient bg-clip-text text-transparent">採用→配置→マネジメント</span>を貫通する
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl leading-relaxed">
            クアッドマインド理論(A/B/C/D 4軸)をベースに、応募から定着まで「同じ言語」で人を捉えるHRプラットフォーム。
            採用ファネルとマネジメントを一画面で繋ぎます。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/recruit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-gradient text-white font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              採用ダッシュボード
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/admin/manage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              マネジメント
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2 SECTIONS */}
      <section className="grid gap-6 md:grid-cols-2">
        <FeatureCard
          tag="SECTION 1"
          accent="brand"
          title="採用ダッシュボード"
          desc="応募 / 1次 / 2次 / 最終 / 合格 のステージ別に応募者を管理。診断結果と履歴書を統合し、面接深掘り質問の自動提案、採用判定までを一気通貫で。"
          href="/admin/recruit"
        />
        <FeatureCard
          tag="SECTION 2"
          accent="emerald"
          title="マネジメント"
          desc="採用後の社員管理。マネジメントガイド、定期再診断、1年後比較、配置最適化提案。同じ人物を時系列で追跡し、定着率と成長を支援。"
          href="/admin/manage"
        />
      </section>

      {/* 3 SUB CARDS */}
      <section className="grid gap-4 md:grid-cols-3">
        <SubCard
          tag="候補者向け"
          title="応募フォーム"
          desc="公開リンクからプロフィール・経歴・診断を入力。"
          link={{ href: "/apply/demo", label: "プレビュー →" }}
          accentClass="border-l-quad-d"
        />
        <SubCard
          tag="管理者向け"
          title="設定"
          desc="入力モード(質問形式/履歴書/併用)、選考段階のラベルを企業ごとにカスタマイズ。"
          link={{ href: "/admin/settings", label: "設定を開く →" }}
          accentClass="border-l-brand-500"
        />
        <SubCard
          tag="デモの見方"
          title="可視化参照点"
          desc="完全機能網羅ではなく実運用フローの可視化を優先。本番では認証・監査ログ・OCR精緻化が入ります。"
          accentClass="border-l-quad-b"
        />
      </section>

      {/* 4軸の説明 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AxisCard axis="A" title="動物的感情" desc="感受性 / 即時の反応 / 共感" tone="bg-rose-50 border-rose-200 text-rose-700" />
        <AxisCard axis="B" title="機械的感情" desc="承認 / 羞恥 / 社会的同調" tone="bg-amber-50 border-amber-200 text-amber-700" />
        <AxisCard axis="C" title="動物的理性" desc="直感 / 経験圧縮 / 非言語的判断" tone="bg-emerald-50 border-emerald-200 text-emerald-700" />
        <AxisCard axis="D" title="機械的理性" desc="論理 / 分析 / 計画 / 説明" tone="bg-blue-50 border-blue-200 text-blue-700" />
      </section>
    </div>
  );
}

function FeatureCard({
  tag,
  title,
  desc,
  href,
  accent,
}: {
  tag: string;
  title: string;
  desc: string;
  href: string;
  accent: "brand" | "emerald";
}) {
  const accentBar =
    accent === "brand" ? "bg-brand-gradient" : "bg-gradient-to-r from-emerald-400 to-emerald-600";
  return (
    <Link
      href={href}
      className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className={"h-1 " + accentBar} />
      <div className="p-6">
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-2">
          {tag}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors">
          {title} <span aria-hidden className="text-slate-400">→</span>
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}

function SubCard({
  tag,
  title,
  desc,
  link,
  accentClass,
}: {
  tag: string;
  title: string;
  desc: string;
  link?: { href: string; label: string };
  accentClass: string;
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 border-l-4 ${accentClass} shadow-soft`}>
      <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-1">
        {tag}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{desc}</p>
      {link && (
        <Link href={link.href} className="text-brand-600 text-sm font-semibold hover:text-brand-700">
          {link.label}
        </Link>
      )}
    </div>
  );
}

function AxisCard({
  axis,
  title,
  desc,
  tone,
}: {
  axis: string;
  title: string;
  desc: string;
  tone: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-bold text-2xl">{axis}</span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="text-xs opacity-80">{desc}</p>
    </div>
  );
}
