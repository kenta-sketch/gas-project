import { TYPE_DESCRIPTIONS } from "@/data/typeDescriptions";
import type { QuadType } from "@/lib/types";

const TONE: Record<string, { bar: string; chip: string; bg: string; border: string }> = {
  rose: { bar: "bg-gradient-to-r from-rose-300 to-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200", bg: "bg-rose-50/40", border: "border-rose-200" },
  amber: { bar: "bg-gradient-to-r from-amber-300 to-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200", bg: "bg-amber-50/40", border: "border-amber-200" },
  emerald: { bar: "bg-gradient-to-r from-emerald-300 to-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50/40", border: "border-emerald-200" },
  blue: { bar: "bg-gradient-to-r from-blue-300 to-blue-500", chip: "bg-blue-50 text-blue-700 border-blue-200", bg: "bg-blue-50/40", border: "border-blue-200" },
  slate: { bar: "bg-gradient-to-r from-slate-300 to-slate-500", chip: "bg-slate-50 text-slate-700 border-slate-200", bg: "bg-slate-50/40", border: "border-slate-200" },
  purple: { bar: "bg-gradient-to-r from-purple-300 to-purple-500", chip: "bg-purple-50 text-purple-700 border-purple-200", bg: "bg-purple-50/40", border: "border-purple-200" },
  cyan: { bar: "bg-gradient-to-r from-cyan-300 to-cyan-500", chip: "bg-cyan-50 text-cyan-700 border-cyan-200", bg: "bg-cyan-50/40", border: "border-cyan-200" },
  indigo: { bar: "bg-gradient-to-r from-indigo-300 to-indigo-500", chip: "bg-indigo-50 text-indigo-700 border-indigo-200", bg: "bg-indigo-50/40", border: "border-indigo-200" },
  pink: { bar: "bg-gradient-to-r from-pink-300 to-pink-500", chip: "bg-pink-50 text-pink-700 border-pink-200", bg: "bg-pink-50/40", border: "border-pink-200" },
  yellow: { bar: "bg-gradient-to-r from-yellow-300 to-yellow-500", chip: "bg-yellow-50 text-yellow-700 border-yellow-200", bg: "bg-yellow-50/40", border: "border-yellow-200" },
  gray: { bar: "bg-gradient-to-r from-gray-300 to-gray-500", chip: "bg-gray-50 text-gray-700 border-gray-300", bg: "bg-gray-50/40", border: "border-gray-200" },
  lime: { bar: "bg-gradient-to-r from-lime-300 to-lime-500", chip: "bg-lime-50 text-lime-700 border-lime-200", bg: "bg-lime-50/40", border: "border-lime-200" },
};

interface Props {
  type: QuadType;
  variant?: "brief" | "full";
}

export function TypeInsight({ type, variant = "full" }: Props) {
  const desc = TYPE_DESCRIPTIONS[type];
  const tone = TONE[desc.toneColor];

  if (variant === "brief") {
    return (
      <div className={"rounded-xl border " + tone.border + " " + tone.bg + " overflow-hidden shadow-soft"}>
        <div className={"h-1 " + tone.bar} />
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">
              タイプの傾向(簡易)
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              <span className={"inline-block px-2 py-0.5 rounded-full text-xs border mr-2 " + tone.chip}>{type}</span>
              {desc.headline}
            </h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{desc.summary}</p>
          <div className="flex flex-wrap gap-1">
            {desc.bestFitRoles.slice(0, 3).map((r, i) => (
              <span key={i} className={"text-[11px] px-2 py-0.5 rounded-full border " + tone.chip}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={"rounded-2xl border " + tone.border + " " + tone.bg + " overflow-hidden shadow-soft"}>
      <div className={"h-1 " + tone.bar} />
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-1">
            このタイプの傾向(詳細)
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            <span className={"inline-block px-2 py-0.5 rounded-full text-sm border mr-2 " + tone.chip}>{type}</span>
            {desc.headline}
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">{desc.summary}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
              <span>◎</span>強み
            </div>
            <ul className="text-sm text-slate-700 space-y-1 pl-4 list-disc">
              {desc.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
              <span>⚠</span>気をつけたいシグナル
            </div>
            <ul className="text-sm text-slate-700 space-y-1 pl-4 list-disc">
              {desc.cautions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-slate-200/70">
          <div>
            <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1.5">
              適合度の高い役割
            </div>
            <div className="flex flex-wrap gap-1.5">
              {desc.bestFitRoles.map((r, i) => (
                <span key={i} className={"text-xs px-2 py-0.5 rounded-full border " + tone.chip}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1.5">
              マネジメントのヒント
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{desc.managementHint}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-200/70">
          <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1.5">
            成長の方向
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{desc.growthDirection}</p>
        </div>
      </div>
    </div>
  );
}
