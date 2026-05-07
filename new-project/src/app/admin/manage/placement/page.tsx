"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EMPLOYEES_SEED } from "@/data/employees";
import { ROLE_PROFILES, fitScore, groupedRoles } from "@/data/roleProfiles";
import type { RoleProfile } from "@/data/roleProfiles";
import type { AxisKey } from "@/lib/types";

export default function PlacementPage() {
  const grouped = useMemo(() => groupedRoles(), []);
  const [selectedRole, setSelectedRole] = useState<RoleProfile>(ROLE_PROFILES[0]);

  const ranked = useMemo(() => {
    return EMPLOYEES_SEED.map((e) => {
      const latest = e.diagnoses[e.diagnoses.length - 1];
      return {
        emp: e,
        latest,
        score: fitScore(latest.scores, selectedRole),
      };
    }).sort((a, b) => b.score - a.score);
  }, [selectedRole]);

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/manage" className="text-brand-600 hover:underline">← マネジメント</Link>
      </div>
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">PLACEMENT</div>
        <h1 className="text-3xl font-bold text-slate-900">配置最適化シミュレーション</h1>
        <p className="text-sm text-slate-600 mt-1">
          25職種の理想プロファイル(クアッドマインド職種適性マップ精密版)に対する社員適合度を算出してランク付け。
        </p>
        <p className="text-xs text-slate-500 mt-1">
          出典: <code className="bg-slate-100 px-1 rounded">docs/theory/notes/2026-05-06-quadmind-map.md</code>
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-3">役割を選択(全25職種)</div>
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, roles]) => (
            <div key={category}>
              <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                <span className="w-1 h-3 bg-brand-gradient rounded-full" />
                {category}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((r) => {
                  const active = selectedRole.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r)}
                      className={
                        "text-left p-3 rounded-xl border transition-all " +
                        (active
                          ? "bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-soft"
                          : "bg-white border-slate-200 hover:bg-slate-50")
                      }
                    >
                      <div className="font-bold text-slate-900 text-sm">{r.label}</div>
                      <div className="text-[10px] text-slate-500 mb-1.5">主軸: {r.primary.join(" / ")}</div>
                      <div className="flex gap-1 text-[10px] font-mono">
                        {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
                          const tone =
                            k === "A" ? "bg-rose-50 text-rose-700"
                            : k === "B" ? "bg-amber-50 text-amber-700"
                            : k === "C" ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700";
                          return (
                            <span key={k} className={"px-1.5 py-0.5 rounded " + tone}>
                              {k}:{r.ranges[k][0]}-{r.ranges[k][1]}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
        <strong className="block text-amber-700 mb-1">{selectedRole.label}({selectedRole.category})の理想プロファイル</strong>
        <div>{selectedRole.description}</div>
        <div className="text-xs text-amber-700 mt-2">
          <span className="font-bold">⚠ 危険サイン:</span> {selectedRole.risk}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-slate-900 mb-3">適合度ランキング</h2>
        <div className="space-y-2">
          {ranked.map(({ emp, latest, score }, idx) => {
            const pct = (score * 100).toFixed(1);
            const rank = idx + 1;
            const tone =
              rank === 1 ? "bg-emerald-50 border-emerald-300"
              : rank === 2 ? "bg-emerald-50/50 border-emerald-200"
              : rank === 3 ? "bg-emerald-50/30 border-emerald-200"
              : "bg-white border-slate-200";
            return (
              <Link
                key={emp.id}
                href={`/admin/manage/${emp.id}`}
                className={"block border rounded-xl p-4 shadow-soft hover:shadow-card-hover transition-shadow " + tone}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-400 w-10 text-center">#{rank}</div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-bold text-slate-900">{emp.fullName}</span>
                      <span className="text-xs text-slate-500">{emp.team} · {emp.currentRole}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 ml-auto">
                        {latest.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded">
                        <div
                          className="h-2 bg-brand-gradient rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-brand-700 text-sm">{pct}%</span>
                    </div>
                    <div className="mt-2 flex gap-1 text-[10px] font-mono">
                      {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
                        const v = latest.scores[k];
                        const [min, max] = selectedRole.ranges[k];
                        const inRange = v >= min && v <= max;
                        const tone =
                          k === "A" ? "border-rose-200 text-rose-700"
                          : k === "B" ? "border-amber-200 text-amber-700"
                          : k === "C" ? "border-emerald-200 text-emerald-700"
                          : "border-blue-200 text-blue-700";
                        return (
                          <span
                            key={k}
                            className={
                              "px-1.5 py-0.5 rounded border " + tone +
                              (inRange ? " bg-white" : " bg-slate-50 line-through opacity-60")
                            }
                          >
                            {k}:{v} ({min}-{max})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
