"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findApplicant, loadSettings, setApplicantStage, upsertApplicant } from "@/lib/store";
import { dominantAxis } from "@/lib/scoring";
import { QuadRadar } from "@/components/RadarChart";
import { EmotionBars } from "@/components/EmotionBars";
import { ScoreTable } from "@/components/ScoreTable";
import { StageBadge } from "@/components/StageBadge";
import { TypeInsight } from "@/components/TypeInsight";
import { DiagnosticInsight } from "@/components/DiagnosticInsight";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { Applicant, InterviewRound, PersonalInsight, Settings, StageId } from "@/lib/types";

type Tab = "overview" | "diagnosis" | "career" | "interview" | "decision";

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const a = findApplicant(id);
    setApplicant(a ?? null);
    setSettings(loadSettings());
  }, [id, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  if (!applicant || !settings) {
    return (
      <div>
        <Link href="/admin/recruit" className="text-quad-d text-sm">
          ← 応募者一覧
        </Link>
        <div className="mt-4 text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const latest = applicant.diagnoses[applicant.diagnoses.length - 1];

  function moveStage(next: StageId) {
    setApplicantStage(id, next);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/recruit" className="text-quad-d hover:underline">
          ← 応募者一覧
        </Link>
      </div>

      <header className="bg-white border border-quad-line rounded-lg p-5">
        <div className="flex flex-wrap items-baseline gap-3 mb-3">
          <h1 className="text-2xl font-bold">{applicant.profile.fullName}</h1>
          <StageBadge stage={applicant.currentStage} />
          <span className="text-xs text-gray-500">応募ID: {applicant.id}</span>
          <span className="text-xs text-gray-500 ml-auto">応募日: {applicant.profile.appliedDate}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-3 text-sm text-gray-700">
          <div>応募職種: <span className="font-semibold">{applicant.profile.appliedPosition}</span></div>
          <div>年代/性別: {applicant.profile.ageRange} {applicant.profile.gender}</div>
          <div>連絡先: {applicant.profile.email ?? "—"}</div>
        </div>
      </header>

      <StageController applicant={applicant} settings={settings} onMove={moveStage} />

      <nav className="flex gap-1 border-b border-quad-line">
        {(
          [
            ["overview", "概要"],
            ["career", "経歴"],
            ["diagnosis", "診断結果"],
            ["interview", "面接"],
            ["decision", "判定"],
          ] as [Tab, string][]
        ).map(([t, label]) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " +
                (active
                  ? "border-quad-d text-quad-d"
                  : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              {label}
            </button>
          );
        })}
      </nav>

      {tab === "overview" && <OverviewTab applicant={applicant} />}
      {tab === "career" && <CareerTab applicant={applicant} />}
      {tab === "diagnosis" && latest && <DiagnosisTab applicant={applicant} onUpdate={refresh} />}
      {tab === "interview" && <InterviewTab applicant={applicant} onUpdate={refresh} />}
      {tab === "decision" && <DecisionTab applicant={applicant} settings={settings} onMove={moveStage} />}
    </div>
  );
}

// ──────────────────────────────────────────
// ステージ操作バー
// ──────────────────────────────────────────
function StageController({
  applicant,
  settings,
  onMove,
}: {
  applicant: Applicant;
  settings: Settings;
  onMove: (s: StageId) => void;
}) {
  return (
    <div className="bg-quad-paper border border-quad-line rounded p-3">
      <div className="text-xs tracking-widest text-gray-500 mb-2">ステージ変更</div>
      <div className="flex flex-wrap gap-2">
        {settings.stageOrder.map((s) => {
          const isCurrent = applicant.currentStage === s;
          const tone = isCurrent
            ? "bg-quad-d text-white border-quad-d"
            : "bg-white border-quad-line hover:bg-gray-50 text-gray-700";
          return (
            <button
              key={s}
              onClick={() => onMove(s)}
              disabled={isCurrent}
              className={"text-xs px-3 py-1.5 rounded border transition-colors " + tone}
            >
              {settings.stageLabels[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// 概要タブ
// ──────────────────────────────────────────
function OverviewTab({ applicant }: { applicant: Applicant }) {
  const latest = applicant.diagnoses[applicant.diagnoses.length - 1];
  return (
    <div className="space-y-5">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-3">QUAD MIND RADAR</h2>
          {latest ? <QuadRadar scores={latest.scores} primaryLabel="応募時" /> : "診断未実施"}
        </div>
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">タイプ</div>
            <div className="font-bold text-xl text-slate-900">{latest?.type ?? "—"}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">主エンジン</div>
            <div className="font-bold text-lg text-slate-900">
              {latest ? `${dominantAxis(latest.scores)} ── ${AXIS_LABEL_JA[dominantAxis(latest.scores)]}` : "—"}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">面接</div>
            <div className="font-bold text-lg text-slate-900">{applicant.interviews.length} 回実施</div>
          </div>
        </div>
      </div>
      {latest && <TypeInsight type={latest.type} variant="brief" />}
    </div>
  );
}

// ──────────────────────────────────────────
// 経歴タブ
// ──────────────────────────────────────────
function CareerTab({ applicant }: { applicant: Applicant }) {
  const r = applicant.resume;
  const c = applicant.careerAnswers;

  return (
    <div className="space-y-5">
      {c && (
        <section className="bg-white border border-quad-line rounded-lg p-5">
          <h2 className="font-bold mb-3">質問形式の経歴回答</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs tracking-widest text-gray-500 mb-1">学歴</div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">{c.education}</div>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gray-500 mb-1">職務経歴</div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">{c.workHistory}</div>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gray-500 mb-1">自己PR</div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">{c.selfPR}</div>
            </div>
          </div>
        </section>
      )}
      {r && (
        <section className="bg-white border border-quad-line rounded-lg p-5">
          <h2 className="font-bold mb-3">履歴書(解析結果)</h2>
          {r.fileName && <div className="text-xs text-gray-500 mb-3">ファイル: {r.fileName}</div>}
          <pre className="text-xs bg-quad-paper p-3 rounded overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(r, null, 2)}
          </pre>
        </section>
      )}
      {!c && !r && (
        <div className="bg-amber-50 border border-quad-b/40 rounded p-4 text-sm">
          経歴情報が未入力です。
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 診断結果タブ
// ──────────────────────────────────────────
function DiagnosisTab({ applicant, onUpdate }: { applicant: Applicant; onUpdate: () => void }) {
  const latestIdx = applicant.diagnoses.length - 1;
  const latest = applicant.diagnoses[latestIdx];
  if (!latest) return <div>診断未実施</div>;
  return (
    <div className="space-y-5">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-quad-line rounded p-5">
          <h2 className="text-sm tracking-widest text-gray-500 mb-3">QUAD MIND RADAR</h2>
          <QuadRadar scores={latest.scores} primaryLabel={latest.scenario} />
        </div>
        <div>
          <div className="text-xs tracking-widest text-gray-500">タイプ判定</div>
          <div className="text-2xl font-bold mb-3">{latest.type}</div>
          <div className="text-xs tracking-widest text-gray-500">主エンジン</div>
          <div className="text-lg font-bold mb-4">
            {dominantAxis(latest.scores)} ── {AXIS_LABEL_JA[dominantAxis(latest.scores)]}
          </div>
          <div className="text-xs text-gray-500 mb-1">診断日: {latest.date}</div>
          <div className="text-xs text-gray-500">シナリオ: {latest.scenario}</div>
        </div>
      </section>
      <section>
        <h3 className="font-bold mb-2">A/B/C/D スコア</h3>
        <ScoreTable scores={latest.scores} />
      </section>
      <section>
        <h3 className="font-bold mb-2">5感情</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
          <EmotionBars emotions={latest.emotions} />
        </div>
      </section>
      {latest.result && (
        <section className="space-y-2">
          <h3 className="font-bold">診断詳細(G2/G3/G4/G5)</h3>
          <p className="text-xs text-slate-500">
            管理者向け内部出力です。G5(組織毀損プロファイル)は本人には開示されません。
          </p>
          <DiagnosticInsight result={latest.result} internal={true} />
        </section>
      )}
      <PersonalInsightSection applicant={applicant} diagnosisIdx={latestIdx} onUpdate={onUpdate} />
    </div>
  );
}

// ──────────────────────────────────────────
// AI個別分析セクション(診断結果タブ下部)
// 静的テンプレ(TypeInsight)を AI 生成の PersonalInsight に置き換え
// 一度生成したら applicant.diagnoses[i].personalInsight にキャッシュ
// ──────────────────────────────────────────
function PersonalInsightSection({
  applicant,
  diagnosisIdx,
  onUpdate,
}: {
  applicant: Applicant;
  diagnosisIdx: number;
  onUpdate: () => void;
}) {
  const diagnosis = applicant.diagnoses[diagnosisIdx];
  const insight = diagnosis?.personalInsight;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!diagnosis) return;
    setError(null);
    setGenerating(true);
    try {
      const settings = loadSettings();
      const body = {
        type: diagnosis.type,
        scores: diagnosis.scores,
        emotions: diagnosis.emotions,
        profile: {
          fullName: applicant.profile.fullName,
          ageRange: applicant.profile.ageRange,
          gender: applicant.profile.gender,
          appliedPosition: applicant.profile.appliedPosition,
        },
        company: settings.company,
        career: applicant.careerAnswers
          ? {
              education: applicant.careerAnswers.education,
              workHistory: applicant.careerAnswers.workHistory,
              selfPR: applicant.careerAnswers.selfPR,
            }
          : applicant.resume
            ? {
                education: applicant.resume.education?.map((e) => `${e.school}(${e.period})${e.degree ? " " + e.degree : ""}`).join("\n"),
                workHistory: applicant.resume.workHistory?.map((w) => `${w.company}(${w.period}, ${w.role})${w.description ? " - " + w.description : ""}`).join("\n"),
                selfPR: applicant.resume.selfPR,
              }
            : undefined,
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
      // applicant.diagnoses[diagnosisIdx].personalInsight に保存
      const updatedDiagnoses = applicant.diagnoses.map((d, i) =>
        i === diagnosisIdx ? { ...d, personalInsight: newInsight } : d,
      );
      upsertApplicant({ ...applicant, diagnoses: updatedDiagnoses });
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
            {insight ? "この応募者専用のタイプ説明(AI生成)" : "AI個別分析を生成"}
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
          診断結果(A/B/C/D・5感情・G2/G3/G4/G5・第2層変数)と経歴情報を統合し、
          Claude がこの応募者専用の分析を生成します。同じタイプ判定の人でも、
          スコア配分や経歴が違えば違う文章が出ます。
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
            生成: {new Date(insight.generatedAt).toLocaleString("ja-JP")}{insight.modelVersion ? ` · ${insight.modelVersion}` : ""}
          </div>
        </div>
      )}
    </section>
  );
}

// ──────────────────────────────────────────
// 面接タブ
// ──────────────────────────────────────────
function InterviewTab({
  applicant,
  onUpdate,
}: {
  applicant: Applicant;
  onUpdate: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [interviewer, setInterviewer] = useState("");

  async function generateQuestions() {
    setError(null);
    setGenerating(true);
    try {
      const c = applicant.careerAnswers;
      const r = applicant.resume;
      const careerSummary = [
        c?.education && `学歴: ${c.education}`,
        c?.workHistory && `職務経歴: ${c.workHistory}`,
        c?.selfPR && `自己PR: ${c.selfPR}`,
        r?.workHistory?.length &&
          `履歴書職歴: ${r.workHistory.map((w) => `${w.company}(${w.period}, ${w.role})`).join(" / ")}`,
        r?.selfPR && `履歴書自己PR: ${r.selfPR}`,
      ]
        .filter(Boolean)
        .join("\n");
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          applicantName: applicant.profile.fullName,
          appliedPosition: applicant.profile.appliedPosition,
          stage: applicant.currentStage,
          scores: applicant.diagnoses[0]?.scores,
          emotions: applicant.diagnoses[0]?.emotions,
          type: applicant.diagnoses[0]?.type,
          previousNotes: applicant.interviews.map((i) => i.notes).join("\n"),
          careerSummary,
        }),
      });
      if (!res.ok) {
        setError(`APIエラー (${res.status}): ${(await res.text()).slice(0, 200)}`);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
      }
      // 結果を新しい面接ラウンドのsuggestedQuestionsに格納
      const lines = acc
        .split("\n")
        .map((l) => l.replace(/^[-・*\d.\s)]+/, "").trim())
        .filter((l) => l.length > 5);
      const round: InterviewRound = {
        stageId: applicant.currentStage,
        date: new Date().toISOString().slice(0, 10),
        interviewer: interviewer || "未入力",
        suggestedQuestions: lines.slice(0, 6),
        notes: memo,
        outcome: "pending",
      };
      upsertApplicant({ ...applicant, interviews: [...applicant.interviews, round] });
      setMemo("");
      onUpdate();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-quad-line rounded-lg p-5">
        <h2 className="font-bold mb-3">面接シート(新規作成)</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="面接官の名前"
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
            className="w-full border border-quad-line rounded px-3 py-2 text-sm"
          />
          <textarea
            placeholder="面接メモ(任意でAI生成前に記入)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full border border-quad-line rounded px-3 py-2 text-sm h-24"
          />
          <button
            onClick={generateQuestions}
            disabled={generating}
            className={
              "px-4 py-2 rounded font-semibold text-sm " +
              (generating
                ? "bg-gray-200 text-gray-500"
                : "bg-quad-d text-white hover:bg-blue-700")
            }
          >
            {generating ? "AIが質問を生成中..." : "AIで深掘り質問を生成 + 面接記録"}
          </button>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">過去の面接({applicant.interviews.length}回)</h2>
        {applicant.interviews.length === 0 ? (
          <div className="bg-quad-paper border border-quad-line rounded p-4 text-sm text-gray-500">
            まだ面接実施なし
          </div>
        ) : (
          applicant.interviews.map((i, idx) => (
            <div key={idx} className="bg-white border border-quad-line rounded p-4">
              <div className="flex items-baseline justify-between mb-2">
                <div className="font-bold">{i.date} · 面接官: {i.interviewer}</div>
                <StageBadge stage={i.stageId} />
              </div>
              {i.suggestedQuestions.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs tracking-widest text-gray-500 mb-1">AI提案質問</div>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                    {i.suggestedQuestions.map((q, qi) => (
                      <li key={qi}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {i.notes && (
                <div>
                  <div className="text-xs tracking-widest text-gray-500 mb-1">面接メモ</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{i.notes}</div>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                判定:{" "}
                <span
                  className={
                    i.outcome === "pass"
                      ? "text-emerald-600 font-bold"
                      : i.outcome === "fail"
                        ? "text-rose-600 font-bold"
                        : "text-gray-500"
                  }
                >
                  {i.outcome === "pass" ? "通過" : i.outcome === "fail" ? "不合格" : i.outcome === "hold" ? "保留" : "判定待ち"}
                </span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

// ──────────────────────────────────────────
// 判定タブ
// ──────────────────────────────────────────
function DecisionTab({
  applicant,
  settings,
  onMove,
}: {
  applicant: Applicant;
  settings: Settings;
  onMove: (s: StageId) => void;
}) {
  const latest = applicant.diagnoses[applicant.diagnoses.length - 1];
  const dom = latest ? dominantAxis(latest.scores) : null;

  return (
    <div className="space-y-5">
      <section className="bg-white border border-quad-line rounded-lg p-5">
        <h2 className="font-bold mb-3">サマリー</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-gray-500">応募職種:</span> {applicant.profile.appliedPosition}
          </div>
          <div>
            <span className="text-gray-500">タイプ:</span> {latest?.type ?? "—"}
          </div>
          <div>
            <span className="text-gray-500">主エンジン:</span> {dom ? `${dom} (${AXIS_LABEL_JA[dom]})` : "—"}
          </div>
          <div>
            <span className="text-gray-500">面接実施:</span> {applicant.interviews.length}回
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => onMove("hired")}
          className="px-4 py-3 rounded font-bold text-white bg-quad-c hover:bg-emerald-600"
        >
          ✓ 採用 → 合格者へ移動
        </button>
        <button
          onClick={() => onMove("rejected")}
          className="px-4 py-3 rounded font-bold text-white bg-quad-a hover:bg-rose-600"
        >
          ✗ 不採用へ移動
        </button>
      </section>

      {applicant.currentStage === "hired" && (
        <section className="bg-emerald-50 border-l-4 border-quad-c rounded p-4 text-sm">
          <strong className="block mb-1">合格者です。マネジメントへ昇格できます。</strong>
          <p className="text-gray-700 mb-3">
            合格者は「マネジメント」セクションの社員データに昇格させることで、自己分析レポート / マネジメントガイド / 1年後比較などの継続支援機能が利用可能になります。
          </p>
          <Link
            href="/admin/manage"
            className="inline-block bg-quad-c text-white text-xs font-bold px-3 py-2 rounded hover:bg-emerald-600"
          >
            マネジメント側へ →
          </Link>
        </section>
      )}

      <section className="text-xs text-gray-500">
        ステージ手動変更:{" "}
        {settings.stageOrder.map((s) => (
          <button
            key={s}
            onClick={() => onMove(s)}
            disabled={applicant.currentStage === s}
            className={
              "ml-1 px-2 py-1 rounded border " +
              (applicant.currentStage === s
                ? "bg-quad-d text-white border-quad-d"
                : "bg-white border-quad-line hover:bg-gray-50")
            }
          >
            {settings.stageLabels[s]}
          </button>
        ))}
      </section>
    </div>
  );
}
