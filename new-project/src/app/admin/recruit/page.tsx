"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listApplicants, loadSettings } from "@/lib/store";
import type { Applicant, Settings, StageId } from "@/lib/types";

const TYPE_BADGE_COLOR: Record<string, string> = {
  理詰め型: "bg-quad-d/10 text-blue-700 border-quad-d",
  承認欲求型: "bg-quad-b/10 text-amber-700 border-quad-b",
  ワガママ型: "bg-quad-a/10 text-rose-700 border-quad-a",
  統合型: "bg-quad-c/10 text-emerald-700 border-quad-c",
  混合型: "bg-gray-100 text-gray-700 border-gray-300",
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

  if (!settings) return <div className="text-gray-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between border-b border-quad-line pb-3">
        <div>
          <div className="text-xs tracking-widest text-gray-500">採用 / RECRUIT</div>
          <h1 className="text-2xl font-bold">応募者ダッシュボード</h1>
          <p className="text-sm text-gray-600 mt-1">
            ステージ別に応募者を表示。ステージのラベルと段数は{" "}
            <Link href="/admin/settings" className="underline text-quad-d">
              設定
            </Link>
            で編集可能。
          </p>
        </div>
        <Link
          href="/apply/demo"
          target="_blank"
          className="text-xs px-3 py-2 rounded border border-quad-line bg-white hover:bg-gray-50"
        >
          応募フォームを開く ↗
        </Link>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-quad-line">
        {settings.stageOrder.map((stage) => {
          const active = activeStage === stage;
          const count = counts[stage] ?? 0;
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={
                "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors " +
                (active
                  ? "border-quad-d text-quad-d"
                  : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              {settings.stageLabels[stage]}
              <span className="ml-2 inline-flex min-w-5 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <div className="bg-white border border-quad-line rounded p-8 text-center text-gray-500 text-sm">
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
                className="block bg-white border border-quad-line rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-bold">{a.profile.fullName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-quad-paper border border-quad-line text-gray-600">
                    {a.presetTendency}
                  </span>
                  {latest && (
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded-full border " + (TYPE_BADGE_COLOR[latest.type] ?? TYPE_BADGE_COLOR["混合型"])
                      }
                    >
                      {latest.type}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">応募日: {a.profile.appliedDate}</span>
                </div>
                <div className="grid gap-1 sm:grid-cols-3 text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500 mr-2">応募職種:</span>
                    {a.profile.appliedPosition}
                  </div>
                  <div>
                    <span className="text-gray-500 mr-2">年代/性別:</span>
                    {a.profile.ageRange} {a.profile.gender}
                  </div>
                  <div>
                    <span className="text-gray-500 mr-2">面接回数:</span>
                    {a.interviews.length}回
                  </div>
                </div>
                {latest && (
                  <div className="mt-2 flex gap-2 text-xs">
                    {(["A", "B", "C", "D"] as const).map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-quad-paper rounded border border-quad-line">
                        {k}: {latest.scores[k]}
                      </span>
                    ))}
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
