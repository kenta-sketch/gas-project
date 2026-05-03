"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listApplicants, loadSettings } from "@/lib/store";
import type { Applicant, Settings, StageId } from "@/lib/types";

const TYPE_BADGE_COLOR: Record<string, string> = {
  理詰め型: "bg-blue-50 text-blue-700 border-blue-200",
  承認欲求型: "bg-amber-50 text-amber-700 border-amber-200",
  ワガママ型: "bg-rose-50 text-rose-700 border-rose-200",
  統合型: "bg-emerald-50 text-emerald-700 border-emerald-200",
  混合型: "bg-slate-50 text-slate-700 border-slate-200",
};

const STAGE_TONE: Record<StageId, { dot: string; activeBg: string; activeBorder: string; activeText: string }> = {
  applied: { dot: "bg-blue-400", activeBg: "bg-blue-50", activeBorder: "border-blue-500", activeText: "text-blue-700" },
  selection_1: { dot: "bg-amber-400", activeBg: "bg-amber-50", activeBorder: "border-amber-500", activeText: "text-amber-700" },
  selection_2: { dot: "bg-amber-500", activeBg: "bg-amber-50", activeBorder: "border-amber-600", activeText: "text-amber-800" },
  selection_final: { dot: "bg-purple-400", activeBg: "bg-purple-50", activeBorder: "border-purple-500", activeText: "text-purple-700" },
  hired: { dot: "bg-emerald-400", activeBg: "bg-emerald-50", activeBorder: "border-emerald-500", activeText: "text-emerald-700" },
  rejected: { dot: "bg-rose-400", activeBg: "bg-rose-50", activeBorder: "border-rose-500", activeText: "text-rose-700" },
};

export default function RecruitDashboardPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("applied");

  useEffect(() => {
    setApplicants(listApplicants());
    setSettings(loadSettings());
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of applicants) c[a.currentStage] = (c[a.currentStage] ?? 0) + 1;
    return c;
  }, [applicants]);

  const filtered = useMemo(
    () => applicants.filter((a) => a.currentStage === activeStage),
    [applicants, activeStage],
  );

  if (!settings) return <div className="text-slate-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">採用 / RECRUIT</div>
          <h1 className="text-3xl font-bold text-slate-900">応募者ダッシュボード</h1>
          <p className="text-sm text-slate-600 mt-1">
            ステージ別に応募者を表示。ラベルや段数は{" "}
            <Link href="/admin/settings" className="underline text-brand-600 hover:text-brand-700">
              設定
            </Link>
            で編集可能。
          </p>
        </div>
        <Link
          href="/apply/demo"
          target="_blank"
          className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-soft text-slate-700"
        >
          応募フォームを開く ↗
        </Link>
      </header>

      {/* ファネル数値サマリー */}
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {settings.stageOrder.map((stage) => {
          const tone = STAGE_TONE[stage];
          const count = counts[stage] ?? 0;
          const active = activeStage === stage;
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={
                "rounded-xl border p-3 text-left transition-all " +
                (active
                  ? `${tone.activeBg} ${tone.activeBorder} shadow-soft`
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50")
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={"w-2 h-2 rounded-full " + tone.dot} />
                <span className={"text-xs font-semibold " + (active ? tone.activeText : "text-slate-600")}>
                  {settings.stageLabels[stage]}
                </span>
              </div>
              <div className={"text-2xl font-bold " + (active ? tone.activeText : "text-slate-900")}>
                {count}
              </div>
            </button>
          );
        })}
      </section>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-sm shadow-soft">
          このステージには現在応募者がいません。
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((a) => {
            const latest = a.diagnoses[a.diagnoses.length - 1];
            return (
              <Link
                key={a.id}
                href={`/admin/recruit/${a.id}`}
                className="group block bg-white border border-slate-200 rounded-xl p-5 shadow-soft hover:shadow-card-hover transition-shadow"
              >
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700">{a.profile.fullName}</h3>
                  {a.presetTendency && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                      {a.presetTendency}
                    </span>
                  )}
                  {latest && (
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded-full border font-medium " +
                        (TYPE_BADGE_COLOR[latest.type] ?? TYPE_BADGE_COLOR["混合型"])
                      }
                    >
                      {latest.type}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">応募日 {a.profile.appliedDate}</span>
                </div>
                <div className="grid gap-1 sm:grid-cols-3 text-sm text-slate-700">
                  <div>
                    <span className="text-slate-500 mr-2">応募職種:</span>
                    {a.profile.appliedPosition}
                  </div>
                  <div>
                    <span className="text-slate-500 mr-2">年代/性別:</span>
                    {a.profile.ageRange} {a.profile.gender}
                  </div>
                  <div>
                    <span className="text-slate-500 mr-2">面接:</span>
                    {a.interviews.length}回
                  </div>
                </div>
                {latest && (
                  <div className="mt-3 flex gap-1.5 text-xs">
                    <ScoreChip axis="A" score={latest.scores.A} />
                    <ScoreChip axis="B" score={latest.scores.B} />
                    <ScoreChip axis="C" score={latest.scores.C} />
                    <ScoreChip axis="D" score={latest.scores.D} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScoreChip({ axis, score }: { axis: "A" | "B" | "C" | "D"; score: number }) {
  const tone =
    axis === "A" ? "bg-rose-50 text-rose-700 border-rose-200"
    : axis === "B" ? "bg-amber-50 text-amber-700 border-amber-200"
    : axis === "C" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <span className={"px-2 py-0.5 rounded border font-mono font-medium " + tone}>
      {axis}:{score}
    </span>
  );
}
