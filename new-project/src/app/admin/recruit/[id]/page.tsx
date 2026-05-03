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
import { AXIS_LABEL_JA } from "@/lib/types";
import type { Applicant, InterviewRound, Settings, StageId } from "@/lib/types";

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
      {tab === "diagnosis" && latest && <DiagnosisTab applicant={applicant} />}
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
function DiagnosisTab({ applicant }: { applicant: Applicant }) {
  const latest = applicant.diagnoses[applicant.diagnoses.length - 1];
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
      <section>
        <TypeInsight type={latest.type} variant="full" />
      </section>
    </div>
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
