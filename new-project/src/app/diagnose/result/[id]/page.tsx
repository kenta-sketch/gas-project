"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { findStandaloneDiagnosis, loadSettings, upsertStandaloneDiagnosis } from "@/lib/store";
import { dominantAxis } from "@/lib/scoring";
import { QuadRadar } from "@/components/RadarChart";
import { EmotionBars } from "@/components/EmotionBars";
import { ScoreTable } from "@/components/ScoreTable";
import { TypeInsight } from "@/components/TypeInsight";
import { DiagnosticInsight } from "@/components/DiagnosticInsight";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { StandaloneDiagnosis, PersonalInsight } from "@/lib/types";

export default function DiagnoseResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [diagnosis, setDiagnosis] = useState<StandaloneDiagnosis | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setDiagnosis(findStandaloneDiagnosis(id) ?? null);
  }, [id, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  if (!diagnosis) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-xl font-bold text-slate-700">診断結果が見つかりません</h1>
        <p className="text-sm text-slate-500 mt-2">
          診断 ID: <span className="font-mono">{id}</span>
          <br />
          このブラウザに保存されていない、または削除された可能性があります。
        </p>
        <Link
          href="/diagnose"
          className="inline-block mt-4 bg-brand-gradient text-white text-sm font-bold px-4 py-2 rounded"
        >
          新しい診断を始める →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-sm flex items-center justify-between">
        <Link href="/diagnose" className="text-brand-700 hover:underline">
          ← 新しい診断を始める
        </Link>
        <span className="text-xs text-slate-400 font-mono">{id}</span>
      </div>

      <header className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
        <div className="flex flex-wrap items-baseline gap-3 mb-3">
          <h1 className="text-2xl font-bold">{diagnosis.profile.fullName} さんの診断結果</h1>
          <span className="text-xs text-slate-500 ml-auto">診断日: {diagnosis.date}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-3 text-sm text-slate-700">
          <div>
            年代/性別: {diagnosis.profile.ageRange} {diagnosis.profile.gender}
          </div>
          {diagnosis.profile.optionalContext && (
            <div className="sm:col-span-2">
              文脈: <span className="text-slate-600">{diagnosis.profile.optionalContext}</span>
            </div>
          )}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">
            QUAD MIND RADAR
          </h2>
          <QuadRadar scores={diagnosis.scores} primaryLabel="セルフ診断" />
        </div>
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">
              タイプ
            </div>
            <div className="font-bold text-2xl text-slate-900">{diagnosis.type}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">
              主エンジン
            </div>
            <div className="font-bold text-lg text-slate-900">
              {dominantAxis(diagnosis.scores)} ── {AXIS_LABEL_JA[dominantAxis(diagnosis.scores)]}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-bold mb-2">A/B/C/D スコア</h3>
        <ScoreTable scores={diagnosis.scores} />
      </section>

      <section>
        <h3 className="font-bold mb-2">5感情</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
          <EmotionBars emotions={diagnosis.emotions} />
        </div>
      </section>

      <section>
        <TypeInsight type={diagnosis.type} variant="full" />
      </section>

      {diagnosis.result && (
        <section className="space-y-2">
          <h3 className="font-bold">診断詳細(G2/G3/G4/G5 + 第2層変数)</h3>
          <DiagnosticInsight result={diagnosis.result} internal={true} />
        </section>
      )}

      <PersonalInsightSection diagnosis={diagnosis} onUpdate={refresh} />

      <footer className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
        <div className="font-bold text-slate-800 mb-1">この診断は何度でも受け直せます</div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          時間経過や環境変化で軸のバランスは変わります。前回からの変化を見るには、
          下記から「同じプロフィールで再診断」を選んでください。
        </p>
        <Link
          href={`/diagnose?previousId=${diagnosis.id}`}
          className="inline-block bg-brand-gradient text-white text-xs font-bold px-3 py-2 rounded"
        >
          同じプロフィールで再診断 →
        </Link>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────
// AI個別分析セクション
// ──────────────────────────────────────────
function PersonalInsightSection({
  diagnosis,
  onUpdate,
}: {
  diagnosis: StandaloneDiagnosis;
  onUpdate: () => void;
}) {
  const insight = diagnosis.personalInsight;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    setGenerating(true);
    try {
      const settings = loadSettings();
      const body = {
        type: diagnosis.type,
        scores: diagnosis.scores,
        emotions: diagnosis.emotions,
        profile: {
          fullName: diagnosis.profile.fullName,
          ageRange: diagnosis.profile.ageRange,
          gender: diagnosis.profile.gender,
          appliedPosition: diagnosis.profile.optionalContext ?? "(セルフ診断)",
        },
        company: settings.company,
        aSeparation: diagnosis.result?.aSeparation
          ? {
              internal: diagnosis.result.aSeparation.internal,
              external: diagnosis.result.aSeparation.external,
              classification: diagnosis.result.aSeparation.classification,
              frozen: diagnosis.result.aSeparation.frozen,
            }
          : undefined,
        integration: diagnosis.result?.integration
          ? {
              observerScore: diagnosis.result.integration.observerScore,
              switchScore: diagnosis.result.integration.switchScore,
              index: diagnosis.result.integration.index,
              status: diagnosis.result.integration.status,
            }
          : undefined,
        responsibility: diagnosis.result?.responsibility
          ? {
              primary: diagnosis.result.responsibility.primary,
              isCompound: diagnosis.result.responsibility.isCompound,
              secondary: diagnosis.result.responsibility.secondary,
            }
          : undefined,
        responseStyle: diagnosis.result?.responseStyle
          ? {
              style: diagnosis.result.responseStyle.style,
              mean: diagnosis.result.responseStyle.mean,
              extremeRatio: diagnosis.result.responseStyle.extremeRatio,
              neutralRatio: diagnosis.result.responseStyle.neutralRatio,
              warnings: diagnosis.result.responseStyle.warnings,
            }
          : undefined,
        neutralFrequency: diagnosis.result?.neutralFrequency
          ? {
              ratio: diagnosis.result.neutralFrequency.ratio,
              highFlag: diagnosis.result.neutralFrequency.highFlag,
            }
          : undefined,
        correlationCorrection: diagnosis.result?.correlationCorrection
          ? {
              pureC: diagnosis.result.correlationCorrection.pureC,
              pureD: diagnosis.result.correlationCorrection.pureD,
              adjustedA: diagnosis.result.correlationCorrection.adjustedA,
              adjustedB: diagnosis.result.correlationCorrection.adjustedB,
            }
          : undefined,
        timings: diagnosis.result?.timings
          ? {
              medianMs: diagnosis.result.timings.medianMs,
              speedProfile: diagnosis.result.timings.speedProfile,
              longConsideredQuestions: diagnosis.result.timings.longConsideredQuestions,
            }
          : undefined,
      };
      const res = await fetch("/api/personal-insight", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `APIエラー (${res.status})`);
        return;
      }
      const newInsight = data.insight as PersonalInsight;
      upsertStandaloneDiagnosis({ ...diagnosis, personalInsight: newInsight });
      onUpdate();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="bg-gradient-to-br from-brand-50/30 to-white border border-brand-200 rounded-2xl p-5 shadow-soft">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-brand-700 font-bold">
            AI個別分析
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            {insight ? "あなた専用の分析(AI生成)" : "AI個別分析を生成"}
          </h3>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className={
            "text-xs px-3 py-1.5 rounded font-bold transition-colors " +
            (generating
              ? "bg-slate-200 text-slate-500"
              : insight
                ? "bg-white border border-brand-300 text-brand-700 hover:bg-brand-50"
                : "bg-brand-gradient text-white hover:shadow-md")
          }
        >
          {generating ? "AIが分析中..." : insight ? "再生成" : "AIで個別分析を生成"}
        </button>
      </div>
      {!insight && !generating && (
        <p className="text-sm text-slate-600 leading-relaxed">
          診断結果(A/B/C/D・5感情・G2/G3/G4/G5・第2層変数)と入力情報を統合し、
          Claude があなた専用の分析を生成します。
          <br />
          <span className="text-xs text-slate-500 mt-1 inline-block">
            ※ 一度生成した結果はキャッシュされます。再生成ボタンで上書き可能。
          </span>
        </p>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded p-3 text-xs text-rose-700">
          ⚠ {error}
        </div>
      )}
      {insight && (
        <div className="space-y-4 mt-2">
          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">{insight.headline}</h4>
            <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-line">
              {insight.summary}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
                <span>◎</span>強み
              </div>
              <ul className="text-sm text-slate-700 space-y-1 pl-4 list-disc">
                {insight.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                <span>⚠</span>気をつけたいシグナル
              </div>
              <ul className="text-sm text-slate-700 space-y-1 pl-4 list-disc">
                {insight.cautions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-brand-200/50">
            <div>
              <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1.5">
                適合度の高い役割
              </div>
              <ul className="text-sm text-slate-700 space-y-1 pl-4 list-disc">
                {insight.bestFitRoles.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1.5">
                マネジメントのヒント
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.managementHint}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-brand-200/50">
            <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1.5">
              成長の方向
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{insight.growthDirection}</p>
          </div>
          <div className="text-[10px] text-slate-400 text-right pt-2 border-t border-slate-100">
            生成: {new Date(insight.generatedAt).toLocaleString("ja-JP")}
            {insight.modelVersion ? ` · ${insight.modelVersion}` : ""}
          </div>
        </div>
      )}
    </section>
  );
}
