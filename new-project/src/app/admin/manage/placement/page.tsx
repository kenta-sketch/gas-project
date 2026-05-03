"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EMPLOYEES_SEED } from "@/data/employees";
import type { AxisKey, AxisScores } from "@/lib/types";

interface RoleProfile {
  id: string;
  label: string;
  team: string;
  // 各軸の理想的な比重(0〜1、合計で1.0)
  weights: AxisScores;
  description: string;
}

const ROLE_PROFILES: RoleProfile[] = [
  {
    id: "sales_lead",
    label: "セールスリーダー",
    team: "セールス部",
    weights: { A: 0.15, B: 0.35, C: 0.3, D: 0.2 },
    description: "対人感受性(B)を主軸に、現場感覚(C)と論理(D)で意思決定するリーダー。",
  },
  {
    id: "cs_leader",
    label: "カスタマーサクセスマネージャー",
    team: "カスタマーサクセス部",
    weights: { A: 0.3, B: 0.35, C: 0.2, D: 0.15 },
    description: "顧客の感情(A)と関係構築(B)を主軸とし、状況判断(C)で動く。",
  },
  {
    id: "engineer_lead",
    label: "テックリード",
    team: "プロダクト開発部",
    weights: { A: 0.05, B: 0.15, C: 0.3, D: 0.5 },
    description: "論理(D)を主軸に、技術判断(C)を重視。対人(A/B)は補助的。",
  },
  {
    id: "pdm",
    label: "プロダクトマネージャー",
    team: "プロダクト開発部",
    weights: { A: 0.15, B: 0.2, C: 0.35, D: 0.3 },
    description: "技術と顧客の橋渡し。直感(C)と論理(D)で要件を握る。",
  },
  {
    id: "marketing",
    label: "マーケティングマネージャー",
    team: "マーケティング部",
    weights: { A: 0.25, B: 0.25, C: 0.3, D: 0.2 },
    description: "感性と分析の統合型。市場の感情(A)と数字(D)の両面で判断。",
  },
  {
    id: "exec_assistant",
    label: "経営企画",
    team: "経営企画",
    weights: { A: 0.05, B: 0.2, C: 0.3, D: 0.45 },
    description: "戦略と数字(D)を主軸に、現場感(C)と組織調整(B)。",
  },
];

// 適合度スコア = 1 - (重み付き正規化距離)
function fitScore(scores: AxisScores, weights: AxisScores): number {
  // 各軸を0..1に正規化(/25)
  const normalized: AxisScores = {
    A: scores.A / 25,
    B: scores.B / 25,
    C: scores.C / 25,
    D: scores.D / 25,
  };
  // 重みも合計1なのでそのまま
  // 適合度 = sum(normalized[k] * weights[k])
  let score = 0;
  (Object.keys(weights) as AxisKey[]).forEach((k) => {
    score += normalized[k] * weights[k];
  });
  return score;
}

export default function PlacementPage() {
  const [selectedRole, setSelectedRole] = useState<RoleProfile>(ROLE_PROFILES[0]);

  const ranked = useMemo(() => {
    return EMPLOYEES_SEED.map((e) => {
      const latest = e.diagnoses[e.diagnoses.length - 1];
      return {
        emp: e,
        latest,
        score: fitScore(latest.scores, selectedRole.weights),
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
          役割の理想プロファイル(4軸の重み付け)に対する各社員の適合度を計算してランク付けします。
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold mb-3">役割を選択</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ROLE_PROFILES.map((r) => {
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
                <div className="text-xs text-slate-500">{r.team}</div>
                <div className="mt-2 flex gap-1 text-[10px] font-mono">
                  {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
                    const tone =
                      k === "A" ? "bg-rose-50 text-rose-700"
                      : k === "B" ? "bg-amber-50 text-amber-700"
                      : k === "C" ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700";
                    return (
                      <span key={k} className={"px-1.5 py-0.5 rounded " + tone}>
                        {k}:{(r.weights[k] * 100).toFixed(0)}%
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
        <strong className="block text-amber-700 mb-1">{selectedRole.label} の理想プロファイル</strong>
        {selectedRole.description}
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
