"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EMPLOYEES_SEED } from "@/data/employees";
import { QuadRadar } from "@/components/RadarChart";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { AxisKey, AxisScores } from "@/lib/types";

export default function TeamBalancePage() {
  const teams = useMemo(() => Array.from(new Set(EMPLOYEES_SEED.map((e) => e.team))), []);
  const [selected, setSelected] = useState<string>(teams[0]);

  const members = useMemo(
    () => EMPLOYEES_SEED.filter((e) => e.team === selected),
    [selected],
  );

  const teamAvg: AxisScores = useMemo(() => {
    const totals: AxisScores = { A: 0, B: 0, C: 0, D: 0 };
    members.forEach((m) => {
      const latest = m.diagnoses[m.diagnoses.length - 1];
      (Object.keys(totals) as AxisKey[]).forEach((k) => (totals[k] += latest.scores[k]));
    });
    const avg: AxisScores = { A: 0, B: 0, C: 0, D: 0 };
    if (members.length > 0) {
      (Object.keys(totals) as AxisKey[]).forEach(
        (k) => (avg[k] = Math.round(totals[k] / members.length)),
      );
    }
    return avg;
  }, [members]);

  const min = (Object.keys(teamAvg) as AxisKey[]).reduce(
    (m, k) => (teamAvg[k] < teamAvg[m] ? k : m),
    "A" as AxisKey,
  );
  const max = (Object.keys(teamAvg) as AxisKey[]).reduce(
    (m, k) => (teamAvg[k] > teamAvg[m] ? k : m),
    "A" as AxisKey,
  );

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/manage" className="text-brand-600 hover:underline">← マネジメント</Link>
      </div>
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">TEAM BALANCE</div>
        <h1 className="text-3xl font-bold text-slate-900">チームバランス</h1>
        <p className="text-sm text-slate-600 mt-1">
          チーム別に4軸の平均スコアを可視化。不足軸・過剰軸を検知し、補強候補を提案します。
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {teams.map((t) => {
          const active = selected === t;
          return (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors " +
                (active
                  ? "bg-brand-600 text-white border-brand-600 shadow-soft"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
              }
            >
              {t}
              <span className="ml-2 text-xs opacity-80">
                ({EMPLOYEES_SEED.filter((e) => e.team === t).length})
              </span>
            </button>
          );
        })}
      </nav>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
          <h2 className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-3">
            {selected} の平均バランス
          </h2>
          <QuadRadar scores={teamAvg} primaryLabel={selected} />
        </div>
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-2">
              軸別平均(25点満点)
            </div>
            <div className="space-y-2">
              {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
                const v = teamAvg[k];
                const tone =
                  k === "A" ? "bg-rose-100"
                  : k === "B" ? "bg-amber-100"
                  : k === "C" ? "bg-emerald-100"
                  : "bg-blue-100";
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1 text-slate-700">
                      <span><span className="font-bold">{k}</span> {AXIS_LABEL_JA[k]}</span>
                      <span className="font-mono font-bold">{v}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded">
                      <div className={"h-2 rounded " + tone} style={{ width: `${(v / 25) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-widest text-amber-700 uppercase font-semibold mb-1">
              ⚠ 不足している軸
            </div>
            <div className="font-bold text-slate-900 mb-1">{min} ── {AXIS_LABEL_JA[min]}</div>
            <p className="text-xs text-slate-700">
              この軸が強い人材を補強候補として加えると、チームの意思決定の幅が広がります。
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-soft">
            <div className="text-[10px] tracking-widest text-emerald-700 uppercase font-semibold mb-1">
              ◎ 強み軸
            </div>
            <div className="font-bold text-slate-900">{max} ── {AXIS_LABEL_JA[max]}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-slate-900 mb-3">構成メンバー({members.length}名)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((emp) => {
            const latest = emp.diagnoses[emp.diagnoses.length - 1];
            return (
              <Link
                key={emp.id}
                href={`/admin/manage/${emp.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 shadow-soft hover:shadow-card-hover transition-shadow"
              >
                <div className="font-bold text-slate-900 mb-1">{emp.fullName}</div>
                <div className="text-xs text-slate-600 mb-2">{emp.currentRole}</div>
                <div className="flex gap-1 text-[10px]">
                  {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
                    const tone =
                      k === "A" ? "bg-rose-50 text-rose-700 border-rose-200"
                      : k === "B" ? "bg-amber-50 text-amber-700 border-amber-200"
                      : k === "C" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";
                    return (
                      <span key={k} className={"px-1.5 py-0.5 rounded border font-mono " + tone}>
                        {k}:{latest.scores[k]}
                      </span>
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
