"use client";

import Link from "next/link";
import { CANDIDATES } from "@/data/candidates";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-2">候補者を選んで診断を開始</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          クアッドマインド理論ベースの採用診断デモ。診断 → スコア → レポート2種 → 1年後変化 までを5分で体感できます。
          まず候補者を選び、シナリオ(採用時 / 1年後)を選択してください。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {CANDIDATES.map((c) => (
          <article
            key={c.id}
            className="bg-white border border-quad-line rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-bold">{c.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-quad-paper border border-quad-line text-gray-600">
                {c.presetTendency}
              </span>
            </div>
            <dl className="text-sm text-gray-700 space-y-1 mb-5">
              <div className="flex">
                <dt className="w-20 text-gray-500">年代</dt>
                <dd>{c.ageRange}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-gray-500">性別</dt>
                <dd>{c.gender}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-gray-500">現職位</dt>
                <dd>{c.currentPosition}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-gray-500">応募職種</dt>
                <dd className="font-semibold text-quad-d">{c.appliedPosition}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2">
              <Link
                href={`/diagnose?candidateId=${c.id}&scenario=採用時`}
                className="block text-center bg-quad-d text-white font-medium py-2 rounded hover:bg-blue-700 transition-colors"
              >
                採用時シナリオで診断
              </Link>
              <Link
                href={`/diagnose?candidateId=${c.id}&scenario=1年後`}
                className="block text-center bg-quad-paper border border-quad-line text-gray-700 font-medium py-2 rounded hover:bg-gray-100 transition-colors"
              >
                1年後シナリオで診断
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg bg-amber-50 border-l-4 border-quad-b p-4 text-sm text-gray-700">
        <strong className="block mb-1">デモの見方</strong>
        友人(理論作者)向けの可視化参照点として作成。完全な機能網羅ではなく「絵があること」を優先しています。本番では履歴書解析・面接質問提案・整合性チェック・認証/監査ログが追加されます。
      </section>
    </div>
  );
}
