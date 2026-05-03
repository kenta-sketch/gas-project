"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EMPLOYEES_SEED } from "@/data/employees";

// IQ ≒ (C + D) / 2 (認知能力)
// EQ ≒ (A + B) / 2 (対人能力)
// IQ/EQ理論との接続装置(マスター構造図 セクション3より)

interface Plot {
  id: string;
  name: string;
  team: string;
  role: string;
  eq: number;
  iq: number;
  type: string;
}

const TYPE_COLOR: Record<string, string> = {
  理詰め型: "#3b82f6",
  承認欲求型: "#f59e0b",
  ワガママ型: "#f43f5e",
  統合型: "#10b981",
  混合型: "#64748b",
};

export default function TalentMapPage() {
  const plots: Plot[] = useMemo(
    () =>
      EMPLOYEES_SEED.map((e) => {
        const latest = e.diagnoses[e.diagnoses.length - 1];
        return {
          id: e.id,
          name: e.fullName,
          team: e.team,
          role: e.currentRole,
          eq: (latest.scores.A + latest.scores.B) / 2,
          iq: (latest.scores.C + latest.scores.D) / 2,
          type: latest.type,
        };
      }),
    [],
  );

  // SVG 座標系: 0..400 (内部padding込みで 40..360 が実描画域)
  const W = 480;
  const H = 480;
  const PAD = 50;
  const inner = W - PAD * 2;
  const xFor = (eq: number) => PAD + (eq / 25) * inner;
  const yFor = (iq: number) => PAD + (1 - iq / 25) * inner;

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/manage" className="text-brand-600 hover:underline">← マネジメント</Link>
      </div>
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">TALENT MAP</div>
        <h1 className="text-3xl font-bold text-slate-900">タレントマップ(EQ × IQ)</h1>
        <p className="text-sm text-slate-600 mt-1">
          Quad Mind を IQ/EQ に翻訳して可視化。<span className="font-semibold">EQ ≒ (A+B)/2</span>(対人能力)、
          <span className="font-semibold"> IQ ≒ (C+D)/2</span>(認知能力)。9-box タレントレビューの代替視点。
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Talent Map">
              {/* 9-box grid lines */}
              {[1 / 3, 2 / 3].map((p) => (
                <g key={"x" + p}>
                  <line
                    x1={PAD + p * inner}
                    y1={PAD}
                    x2={PAD + p * inner}
                    y2={PAD + inner}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={PAD}
                    y1={PAD + p * inner}
                    x2={PAD + inner}
                    y2={PAD + p * inner}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                  />
                </g>
              ))}
              {/* 9-box label tints */}
              {(() => {
                const cells: { label: string; xi: number; yi: number; fill: string }[] = [
                  { label: "感性リーダー", xi: 2, yi: 0, fill: "#ecfeff" }, // EQ高 / IQ高
                  { label: "成長候補", xi: 1, yi: 0, fill: "#f0f9ff" }, // EQ中 / IQ高
                  { label: "専門家", xi: 0, yi: 0, fill: "#eff6ff" }, // EQ低 / IQ高
                  { label: "調整役", xi: 2, yi: 1, fill: "#f0fdf4" }, // EQ高 / IQ中
                  { label: "中核人材", xi: 1, yi: 1, fill: "#f8fafc" },
                  { label: "実務担当", xi: 0, yi: 1, fill: "#f1f5f9" },
                  { label: "ムードメーカー", xi: 2, yi: 2, fill: "#fff1f2" }, // EQ高 / IQ低
                  { label: "サポート", xi: 1, yi: 2, fill: "#fafafa" },
                  { label: "要育成", xi: 0, yi: 2, fill: "#fef2f2" }, // EQ低 / IQ低
                ];
                return cells.map((c) => (
                  <g key={c.label}>
                    <rect
                      x={PAD + (c.xi * inner) / 3}
                      y={PAD + (c.yi * inner) / 3}
                      width={inner / 3}
                      height={inner / 3}
                      fill={c.fill}
                      opacity={0.55}
                    />
                    <text
                      x={PAD + (c.xi * inner) / 3 + inner / 6}
                      y={PAD + (c.yi * inner) / 3 + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#94a3b8"
                      fontWeight="600"
                    >
                      {c.label}
                    </text>
                  </g>
                ));
              })()}

              {/* Axes */}
              <line x1={PAD} y1={PAD + inner} x2={PAD + inner} y2={PAD + inner} stroke="#475569" strokeWidth={1} />
              <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + inner} stroke="#475569" strokeWidth={1} />

              {/* Axis labels */}
              <text x={W - PAD} y={H - 10} textAnchor="end" fontSize="11" fill="#475569" fontWeight="600">
                EQ → (A+B)/2 → 対人能力
              </text>
              <text
                x={15}
                y={PAD + 4}
                fontSize="11"
                fill="#475569"
                fontWeight="600"
                transform={`rotate(-90, 15, ${PAD + 4})`}
              >
                IQ → (C+D)/2 → 認知能力
              </text>

              {/* Plots */}
              {plots.map((p) => (
                <g key={p.id}>
                  <circle
                    cx={xFor(p.eq)}
                    cy={yFor(p.iq)}
                    r={8}
                    fill={TYPE_COLOR[p.type] ?? "#64748b"}
                    fillOpacity={0.85}
                    stroke="white"
                    strokeWidth={2}
                  />
                  <text
                    x={xFor(p.eq) + 11}
                    y={yFor(p.iq) + 4}
                    fontSize="10"
                    fill="#0f172a"
                    fontWeight="600"
                  >
                    {p.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold mb-2">
                凡例(タイプ別)
              </div>
              <div className="space-y-1.5 text-xs">
                {Object.entries(TYPE_COLOR).map(([t, c]) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />
                    <span className="text-slate-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
              <strong className="block text-amber-700 mb-1">読み方</strong>
              右上ほど「リーダー候補」、左下ほど「育成優先」。
              ただし Quad Mind 視点では「IQ/EQ高=偉い」ではなく、組織の役割への適合度で判断します。
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-slate-900 mb-3">プロット明細</h2>
        <div className="grid gap-2">
          {plots.map((p) => (
            <Link
              key={p.id}
              href={`/admin/manage/${p.id}`}
              className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3 shadow-soft hover:shadow-card-hover transition-shadow"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: TYPE_COLOR[p.type] ?? "#64748b" }}
              />
              <span className="font-bold text-slate-900 w-32">{p.name}</span>
              <span className="text-xs text-slate-600 flex-1">{p.team} · {p.role}</span>
              <span className="text-xs font-mono text-slate-500">EQ {p.eq.toFixed(1)} · IQ {p.iq.toFixed(1)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
