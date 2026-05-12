"use client";

import type { DiagnosticResult } from "@/lib/types";

interface Props {
  result: DiagnosticResult;
  // 内部出力(管理職向け) = 組織毀損プロファイル表示。false = 本人向け(非表示)
  internal?: boolean;
}

const SEPARATION_TONE: Record<string, string> = {
  真性A低: "bg-slate-50 border-slate-200 text-slate-700",
  A抑圧型: "bg-pink-50 border-pink-200 text-pink-700",
  A凍結型: "bg-gray-50 border-gray-300 text-gray-800",
  A管理型: "bg-emerald-50 border-emerald-200 text-emerald-700",
  演技的表出フラグ: "bg-amber-50 border-amber-200 text-amber-700",
};

const INTEGRATION_TONE: Record<string, string> = {
  本物の統合: "bg-emerald-50 border-emerald-200 text-emerald-700",
  部分統合: "bg-blue-50 border-blue-200 text-blue-700",
  偽の中庸: "bg-yellow-50 border-yellow-200 text-yellow-700",
  単独運転: "bg-rose-50 border-rose-200 text-rose-700",
};

const RESPONSIBILITY_TONE: Record<string, string> = {
  D型: "bg-blue-50 border-blue-200 text-blue-700",
  B型: "bg-amber-50 border-amber-200 text-amber-700",
  A型: "bg-rose-50 border-rose-200 text-rose-700",
};

const RESPONSIBILITY_LABEL: Record<string, string> = {
  D型: "規範・ルール準拠型",
  B型: "他者期待応答型",
  A型: "結果・自己感情準拠型",
};

const RISK_TONE: Record<string, string> = {
  low: "bg-slate-50 border-slate-200 text-slate-600",
  medium: "bg-amber-50 border-amber-300 text-amber-800",
  high: "bg-rose-50 border-rose-300 text-rose-800",
};

const RESPONSE_STYLE_LABEL: Record<string, string> = {
  Modest: "穏当型(2-4中心)",
  Discriminant: "識別型(1-5幅広く)",
  Extreme: "極端型(1か5中心)",
  Neutral: "中立型(3中心)",
  Acquiescence: "同意型(全体高め)",
  Disacquiescence: "否定型(全体低め)",
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
  const { aSeparation, integration, responsibility, orgRisk, responseStyle, neutralFrequency, correlationCorrection, timings } = result;

  return (
    <div className="space-y-4">
      {/* A発火/A表出の分離 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
          A 発火 / A 表出の分離(G2)
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">内的A(感情の強さ)</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{aSeparation.internal}</span>
              <span className="text-xs text-slate-500">/ 25</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded mt-1.5">
              <div className="h-1.5 bg-rose-400 rounded" style={{ width: `${(aSeparation.internal / 25) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">表出A(外に出すか)</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{aSeparation.external}</span>
              <span className="text-xs text-slate-500">/ 25</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded mt-1.5">
              <div className="h-1.5 bg-rose-300 rounded" style={{ width: `${(aSeparation.external / 25) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">判定タイプ</div>
            <span className={"inline-block text-xs px-2 py-1 rounded-full border font-bold " + (SEPARATION_TONE[aSeparation.classification] ?? "bg-slate-50 border-slate-200")}>
              {aSeparation.classification}
            </span>
            {aSeparation.frozen && (
              <div className="text-xs text-gray-700 mt-1.5 leading-relaxed">
                ⚠ 凍結フラグ: 専門的なサポートの併用を推奨
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 統合状態 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
          統合状態の直接検出(G4)
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">Observer 起動</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{integration.observerScore}</span>
              <span className="text-xs text-slate-500">/ 30</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">切り替え自覚</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{integration.switchScore}</span>
              <span className="text-xs text-slate-500">/ 30</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">統合指数 / 判定</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-slate-900">{integration.index.toFixed(1)}</span>
            </div>
            <span className={"inline-block text-xs px-2 py-0.5 rounded-full border font-bold " + (INTEGRATION_TONE[integration.status] ?? "bg-slate-50 border-slate-200")}>
              {integration.status}
            </span>
          </div>
        </div>
        {integration.status === "偽の中庸" && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
            スコアは均衡していますが、切り替え体験の自覚が低い傾向。再診断で各軸を具体的な場面で振り返ることを推奨。
          </div>
        )}
      </section>

      {/* 責任感の形態 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
          責任感の形態(G3)
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          {(["D型", "B型", "A型"] as const).map((k) => (
            <div key={k}>
              <div className="text-xs text-slate-500 mb-1">{k} ({RESPONSIBILITY_LABEL[k]})</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{responsibility.scores[k]}</span>
                <span className="text-xs text-slate-500">/ 20</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded mt-1.5">
                <div
                  className={
                    "h-1.5 rounded " +
                    (k === "D型" ? "bg-blue-400" : k === "B型" ? "bg-amber-400" : "bg-rose-400")
                  }
                  style={{ width: `${((responsibility.scores[k] - 4) / 16) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-baseline gap-3 text-sm">
          <span className="text-slate-500 text-xs">主責任感:</span>
          <span className={"text-xs px-2 py-0.5 rounded-full border font-bold " + RESPONSIBILITY_TONE[responsibility.primary]}>
            {responsibility.primary}({RESPONSIBILITY_LABEL[responsibility.primary]})
          </span>
          {responsibility.isCompound && responsibility.secondary && (
            <>
              <span className="text-slate-400">×</span>
              <span className={"text-xs px-2 py-0.5 rounded-full border " + RESPONSIBILITY_TONE[responsibility.secondary]}>
                {responsibility.secondary}
              </span>
              <span className="text-xs text-slate-500">複合型</span>
            </>
          )}
        </div>
      </section>

      {/* 組織毀損プロファイル(内部出力のみ) */}
      {internal && orgRisk.hasAnyRisk && (
        <section className="bg-rose-50/40 border border-rose-200 rounded-xl p-4">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-rose-700 font-bold">
                組織毀損プロファイル(G5)
              </div>
              <div className="text-xs text-rose-600 mt-0.5">管理職向け・スタッフへの開示禁止</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">
              内部出力
            </span>
          </div>
          <div className="space-y-2">
            {orgRisk.flags.map((f) => (
              <div key={f.category} className={"p-3 rounded border " + (RISK_TONE[f.level] ?? RISK_TONE.low)}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-bold text-sm">⚠ {f.category}</span>
                  <span className="text-xs font-mono">{f.score}/15 ({f.level})</span>
                </div>
                <div className="text-xs leading-relaxed">
                  {f.category === "承認略奪型" && "承認欲求の処理パターンに注意が必要な傾向。面接での深掘りを推奨。"}
                  {f.category === "ルール暴力型" && "正論による場の支配傾向。チームの心理的安全性への影響を確認。"}
                  {f.category === "衝動暴走型" && "感情の波が大きく、チームの予測可能性に影響するリスクがある。"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 倫理的注意: 本人向けには出力していない */}
      {!internal && orgRisk.hasAnyRisk && (
        <section className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-slate-700">
          一部の傾向については、管理者面談で個別に確認することを推奨します(詳細は管理者ビューに表示)。
        </section>
      )}

      {/* ===== 第2層変数(2026-05-12 追加) ===== */}
      {(responseStyle || neutralFrequency || correlationCorrection || timings) && internal && (
        <section className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-600 font-bold">
              第2層変数:回答メタ分析
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              122人実証ベース
            </span>
          </div>

          {/* Response Style Profile */}
          {responseStyle && (
            <div className="bg-white border border-slate-200 rounded p-3 mb-2">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Response Style Profile</span>
                <span className={"text-xs px-2 py-0.5 rounded-full border font-bold " + (RESPONSE_STYLE_TONE[responseStyle.style] ?? "bg-slate-50 border-slate-200")}>
                  {RESPONSE_STYLE_LABEL[responseStyle.style] ?? responseStyle.style}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 mb-2">
                {([1, 2, 3, 4, 5] as const).map((v) => {
                  const total = Object.values(responseStyle.distribution).reduce((s, x) => s + x, 0);
                  const pct = total > 0 ? (responseStyle.distribution[v] / total) * 100 : 0;
                  return (
                    <div key={v} className="text-center">
                      <div className="text-[10px] text-slate-500 mb-0.5">{v}</div>
                      <div className="h-6 bg-slate-100 rounded relative overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-brand-gradient"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5 font-mono">{pct.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <div>平均 {responseStyle.mean.toFixed(2)} / SD {responseStyle.sd.toFixed(2)} / 同意バイアス {responseStyle.acquiescenceBias > 0 ? "+" : ""}{responseStyle.acquiescenceBias.toFixed(2)}</div>
                <div>極端度 {(responseStyle.extremeRatio * 100).toFixed(0)}% / 中立度 {(responseStyle.neutralRatio * 100).toFixed(0)}% / 中庸度 {(responseStyle.midRatio * 100).toFixed(0)}%</div>
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

          {/* Neutral Frequency */}
          {neutralFrequency && (
            <div className="bg-white border border-slate-200 rounded p-3 mb-2">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Neutral Frequency(中立3の選択率)</span>
                {neutralFrequency.highFlag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                    高め({">"}30%)
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{(neutralFrequency.ratio * 100).toFixed(1)}%</span>
                <span className="text-xs text-slate-500">({neutralFrequency.count} / {neutralFrequency.total})</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded mt-1.5 relative">
                <div
                  className={"h-1.5 rounded " + (neutralFrequency.highFlag ? "bg-amber-400" : "bg-slate-400")}
                  style={{ width: `${Math.min(neutralFrequency.ratio * 100, 100)}%` }}
                />
                {/* 30% 線 */}
                <div className="absolute top-0 bottom-0 w-px bg-amber-500" style={{ left: "30%" }} />
              </div>
              {neutralFrequency.highFlag && (
                <div className="text-[11px] text-amber-800 mt-2">
                  ⚠ 中立選択が30%超。質問が刺さっていない、解離傾向、または無感覚の可能性。再診断または聞き取りを推奨。
                </div>
              )}
            </div>
          )}

          {/* 軸間相関補正 */}
          {correlationCorrection && (
            <div className="bg-white border border-slate-200 rounded p-3 mb-2">
              <div className="text-xs font-bold text-slate-700 mb-2">軸間相関補正(122人実証から)</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                  <div className="text-emerald-700 font-bold mb-0.5">純粋 C 成分</div>
                  <div className="text-emerald-900 font-mono">{correlationCorrection.pureC.toFixed(1)}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="text-blue-700 font-bold mb-0.5">純粋 D 成分</div>
                  <div className="text-blue-900 font-mono">{correlationCorrection.pureD.toFixed(1)}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded p-2">
                  <div className="text-rose-700 font-bold mb-0.5">補正 A</div>
                  <div className="text-rose-900 font-mono">{correlationCorrection.adjustedA.toFixed(1)}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-2">
                  <div className="text-purple-700 font-bold mb-0.5">補正 B</div>
                  <div className="text-purple-900 font-mono">{correlationCorrection.adjustedB.toFixed(1)}</div>
                </div>
              </div>
              <div className="mt-2 space-y-0.5 text-[10px] text-slate-500 leading-relaxed">
                {correlationCorrection.notes.map((n, i) => (
                  <div key={i}>· {n}</div>
                ))}
              </div>
            </div>
          )}

          {/* 回答時間プロファイル */}
          {timings && (
            <div className="bg-white border border-slate-200 rounded p-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">回答時間プロファイル</span>
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
                  <span className="text-slate-500">長考(中央値の2倍以上):</span>{" "}
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
