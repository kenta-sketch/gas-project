"use client";

import type { DiagnosticResult } from "@/lib/types";

interface Props {
  result: DiagnosticResult;
  /** true=管理者向け(全部表示) / false=本人向け */
  internal?: boolean;
}

// ============================================================
// トーン定義
// ============================================================
const SEPARATION_TONE: Record<string, string> = {
  真性A低: "bg-slate-50 border-slate-200 text-slate-700",
  A抑圧型: "bg-pink-50 border-pink-200 text-pink-700",
  A凍結型: "bg-gray-50 border-gray-300 text-gray-800",
  A管理型: "bg-emerald-50 border-emerald-200 text-emerald-700",
  演技的表出フラグ: "bg-amber-50 border-amber-200 text-amber-700",
};

// A分類の一般語ラベル(管理者画面で使用)
const SEPARATION_LABEL: Record<string, string> = {
  真性A低: "感情が動きにくいタイプ",
  A抑圧型: "感情はあるが外に出さないタイプ",
  A凍結型: "感情が止まっているタイプ(要注意)",
  A管理型: "感情を扱えているタイプ",
  演技的表出フラグ: "外向きの表現と内側にギャップあり",
};

const INTEGRATION_TONE: Record<string, string> = {
  本物の統合: "bg-emerald-50 border-emerald-200 text-emerald-700",
  部分統合: "bg-blue-50 border-blue-200 text-blue-700",
  偽の中庸: "bg-yellow-50 border-yellow-200 text-yellow-700",
  単独運転: "bg-rose-50 border-rose-200 text-rose-700",
};

const INTEGRATION_LABEL: Record<string, string> = {
  本物の統合: "気づきと行動のバランスが取れている",
  部分統合: "気づきはあるが一部の軸が偏っている",
  偽の中庸: "バランス良く見えるが気づきが弱い",
  単独運転: "1つのモードで動きがち",
};

const ALLIANCE_TONE: Record<string, string> = {
  weak: "bg-slate-50 border-slate-200 text-slate-500",
  medium: "bg-amber-50 border-amber-300 text-amber-800",
  strong: "bg-rose-50 border-rose-300 text-rose-800",
};

const PLATFORM_TONE: Record<string, string> = {
  good: "bg-emerald-50 border-emerald-200 text-emerald-700",
  warn: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-rose-50 border-rose-200 text-rose-700",
};

const BC_TONE: Record<string, string> = {
  healthy: "bg-emerald-50 border-emerald-200 text-emerald-700",
  distorted: "bg-rose-50 border-rose-200 text-rose-700",
  low: "bg-slate-50 border-slate-200 text-slate-500",
};

const BC_LABEL: Record<string, string> = {
  healthy: "健全に機能",
  distorted: "歪みあり(過去の経験が影響)",
  low: "対人経験を蓄積中",
};

const RESPONSE_STYLE_LABEL: Record<string, string> = {
  Modest: "穏当(2-4を多く使う)",
  Discriminant: "識別型(1-5を幅広く使う)",
  Extreme: "極端(1か5を選びやすい)",
  Neutral: "中立寄り(3が多い)",
  Acquiescence: "同意傾向(全体的に高め)",
  Disacquiescence: "否定傾向(全体的に低め)",
};

const RESPONSE_STYLE_TONE: Record<string, string> = {
  Modest: "bg-blue-50 border-blue-200 text-blue-700",
  Discriminant: "bg-emerald-50 border-emerald-200 text-emerald-700",
  Extreme: "bg-rose-50 border-rose-200 text-rose-700",
  Neutral: "bg-slate-50 border-slate-300 text-slate-700",
  Acquiescence: "bg-amber-50 border-amber-200 text-amber-700",
  Disacquiescence: "bg-purple-50 border-purple-200 text-purple-700",
};

export function DiagnosticInsight({ result, internal = false }: Props) {
  const {
    aSeparation,
    integration,
    bcInsight,
    alliances,
    platform,
    overObserver,
    responseStyle,
    neutralFrequency,
    correlationCorrection,
    timings,
  } = result;

  return (
    <div className="space-y-4">
      {/* ============================================================
          1. 内側 vs 外に出す感情(情熱の分離)
       ============================================================ */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
          内側の情熱 / 外に出す情熱
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">内側で感じる強さ</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{aSeparation.internal}</span>
              <span className="text-xs text-slate-500">/ 25</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded mt-1.5">
              <div className="h-1.5 bg-rose-400 rounded" style={{ width: `${(aSeparation.internal / 25) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">外に出せる強さ</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{aSeparation.external}</span>
              <span className="text-xs text-slate-500">/ 25</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded mt-1.5">
              <div className="h-1.5 bg-rose-300 rounded" style={{ width: `${(aSeparation.external / 25) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">タイプ</div>
            <span className={"inline-block text-xs px-2 py-1 rounded-full border font-bold " + (SEPARATION_TONE[aSeparation.classification] ?? "bg-slate-50 border-slate-200")}>
              {SEPARATION_LABEL[aSeparation.classification] ?? aSeparation.classification}
            </span>
            {aSeparation.frozen && (
              <div className="text-xs text-gray-700 mt-1.5 leading-relaxed">
                ⚠ 凍結のサイン: 身体の回復を最優先に
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. 気づきの力(統合状態 + 考えすぎ)
       ============================================================ */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
          気づきの力(考えて選び直せるか)
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">気づきスコア</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{integration.observerScore}</span>
              <span className="text-xs text-slate-500">/ 30</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">事後→途中→事前 と進化する</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">統合の状態</div>
            <span className={"inline-block text-xs px-2 py-0.5 rounded-full border font-bold " + (INTEGRATION_TONE[integration.status] ?? "bg-slate-50 border-slate-200")}>
              {integration.status}
            </span>
            <div className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              {INTEGRATION_LABEL[integration.status]}
            </div>
          </div>
          <div>
            {overObserver && (
              <>
                <div className="text-xs text-slate-500 mb-1">考えすぎ状態</div>
                <div className="flex items-baseline gap-1">
                  <span className={"text-2xl font-bold " + (overObserver.flag ? "text-amber-700" : "text-slate-900")}>
                    {overObserver.level.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">/ 5</span>
                </div>
                {overObserver.flag && (
                  <div className="text-[11px] text-amber-700 mt-1 leading-relaxed">⚠ 考えすぎサイン</div>
                )}
              </>
            )}
          </div>
        </div>
        {overObserver?.flag && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
            {overObserver.note}
          </div>
        )}
      </section>

      {/* ============================================================
          3. 人を読む力(B由来C・対人カン)
       ============================================================ */}
      {bcInsight && (
        <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
          <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
            人を読む力(対人カン)
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">対人カンの強さ</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{bcInsight.score}</span>
                <span className="text-xs text-slate-500">/ 25</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded mt-1.5">
                <div className="h-1.5 bg-purple-400 rounded" style={{ width: `${(bcInsight.score / 25) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">状態</div>
              <span className={"inline-block text-xs px-2 py-1 rounded-full border font-bold " + (BC_TONE[bcInsight.status] ?? "bg-slate-50 border-slate-200")}>
                {BC_LABEL[bcInsight.status] ?? bcInsight.status}
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">対人不信(歪み指標)</div>
              <div className="flex items-baseline gap-1">
                <span className={"text-2xl font-bold " + (bcInsight.distortion >= 4 ? "text-rose-700" : "text-slate-900")}>
                  {bcInsight.distortion}
                </span>
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">「人は裏切る」傾向</div>
            </div>
          </div>
          {bcInsight.status === "distorted" && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded p-2 text-xs text-rose-800">
              対人カンは高いが、過去の経験から「人を信用しない方向」に固定化している可能性。修復経験を増やすことでカンが柔軟になる。
            </div>
          )}
        </section>
      )}

      {/* ============================================================
          4. 強みのペア(エンジン同盟)
       ============================================================ */}
      {alliances && alliances.flags.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold">
              強みのペア・組み合わせクセ
            </div>
            {alliances.hasStrongPair && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-300 bg-rose-50 text-rose-700 font-bold">
                強いペアあり
              </span>
            )}
          </div>
          <div className="space-y-2">
            {alliances.flags.map((f) => (
              <div key={f.kind} className={"p-3 rounded border " + (ALLIANCE_TONE[f.level] ?? ALLIANCE_TONE.weak)}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-bold text-sm">{f.label}</span>
                  <span className="text-xs font-mono">
                    {f.strength.toFixed(1)} / 5({f.level === "strong" ? "強" : f.level === "medium" ? "中" : "弱"})
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 leading-relaxed">
            ※ 「強み」と見える組み合わせほど、他の軸が見えづらくなる傾向があります。盲点として認識することが介入の入口です。
          </div>
        </section>
      )}

      {/* ============================================================
          5. コンディション(Platform層)
       ============================================================ */}
      {platform && (
        <section className={"rounded-xl border p-4 shadow-soft " + (PLATFORM_TONE[platform.status] ?? "bg-white border-slate-200")}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] tracking-[0.25em] uppercase font-semibold">
              コンディション(土台)
            </div>
            <span className="text-xs font-bold">{platform.score} / 10</span>
          </div>
          <p className="text-xs leading-relaxed">{platform.note}</p>
        </section>
      )}

      {/* ============================================================
          6. 第2層変数(管理者向けのみ)
       ============================================================ */}
      {internal && (responseStyle || neutralFrequency || correlationCorrection || timings) && (
        <section className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-600 font-bold">
              回答メタ分析(第2層)
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              管理者向け
            </span>
          </div>

          {responseStyle && (
            <div className="bg-white border border-slate-200 rounded p-3 mb-2">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">回答のクセ</span>
                <span className={"text-xs px-2 py-0.5 rounded-full border font-bold " + (RESPONSE_STYLE_TONE[responseStyle.style] ?? "bg-slate-50 border-slate-200")}>
                  {RESPONSE_STYLE_LABEL[responseStyle.style] ?? responseStyle.style}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                平均 {responseStyle.mean.toFixed(2)} / 同意バイアス {responseStyle.acquiescenceBias > 0 ? "+" : ""}
                {responseStyle.acquiescenceBias.toFixed(2)} / 極端度 {(responseStyle.extremeRatio * 100).toFixed(0)}% /
                中立度 {(responseStyle.neutralRatio * 100).toFixed(0)}%
              </div>
              {responseStyle.warnings.length > 0 && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-800 space-y-0.5">
                  {responseStyle.warnings.map((w, i) => (
                    <div key={i}>⚠ {w}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {neutralFrequency && (
            <div className="bg-white border border-slate-200 rounded p-3 mb-2">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">「どちらでもない」(3)の選択率</span>
                {neutralFrequency.highFlag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                    高め({">"}30%)
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{(neutralFrequency.ratio * 100).toFixed(1)}%</span>
                <span className="text-xs text-slate-500">
                  ({neutralFrequency.count} / {neutralFrequency.total})
                </span>
              </div>
              {neutralFrequency.highFlag && (
                <div className="text-[11px] text-amber-800 mt-2">
                  ⚠ 質問に乗りきれていない・自己観察が薄い・回避の可能性。再診断 or 別の場での聞き取り推奨。
                </div>
              )}
            </div>
          )}

          {correlationCorrection && (
            <div className="bg-white border border-slate-200 rounded p-3 mb-2">
              <div className="text-xs font-bold text-slate-700 mb-2">軸間相関補正(122人実証ベース)</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                  <div className="text-emerald-700 font-bold mb-0.5">純粋 洞察</div>
                  <div className="text-emerald-900 font-mono">{correlationCorrection.pureC.toFixed(1)}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="text-blue-700 font-bold mb-0.5">純粋 論理</div>
                  <div className="text-blue-900 font-mono">{correlationCorrection.pureD.toFixed(1)}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded p-2">
                  <div className="text-rose-700 font-bold mb-0.5">補正 情熱</div>
                  <div className="text-rose-900 font-mono">{correlationCorrection.adjustedA.toFixed(1)}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-2">
                  <div className="text-purple-700 font-bold mb-0.5">補正 関係</div>
                  <div className="text-purple-900 font-mono">{correlationCorrection.adjustedB.toFixed(1)}</div>
                </div>
              </div>
            </div>
          )}

          {timings && (
            <div className="bg-white border border-slate-200 rounded p-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">回答ペース</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold bg-slate-50 border-slate-200 text-slate-700">
                  {timings.speedProfile}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <div className="text-slate-500">合計</div>
                  <div className="font-mono text-slate-900 font-bold">{(timings.totalMs / 1000).toFixed(1)}秒</div>
                </div>
                <div>
                  <div className="text-slate-500">平均/問</div>
                  <div className="font-mono text-slate-900 font-bold">{(timings.meanMs / 1000).toFixed(1)}秒</div>
                </div>
                <div>
                  <div className="text-slate-500">中央値</div>
                  <div className="font-mono text-slate-900 font-bold">{(timings.medianMs / 1000).toFixed(1)}秒</div>
                </div>
              </div>
              {timings.longConsideredQuestions.length > 0 && (
                <div className="mt-2 text-[11px] text-slate-700">
                  <span className="text-slate-500">特に時間がかかった質問:</span>{" "}
                  <span className="font-mono">{timings.longConsideredQuestions.join(", ")}</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
