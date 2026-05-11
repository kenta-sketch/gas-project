import type { QuadType } from "@/lib/types";

// 12タイプ用 Tailwind ToneClass(バッジ用)
export const TYPE_TONE: Record<QuadType, string> = {
  統合型: "bg-emerald-50 text-emerald-700 border-emerald-200",
  突破型: "bg-rose-50 text-rose-700 border-rose-200",
  共感型: "bg-amber-50 text-amber-700 border-amber-200",
  設計型: "bg-blue-50 text-blue-700 border-blue-200",
  忠実型: "bg-indigo-50 text-indigo-700 border-indigo-200",
  直感型: "bg-cyan-50 text-cyan-700 border-cyan-200",
  分析型: "bg-slate-50 text-slate-700 border-slate-200",
  蓄積型: "bg-purple-50 text-purple-700 border-purple-200",
  A抑圧型: "bg-pink-50 text-pink-700 border-pink-200",
  A凍結型: "bg-gray-50 text-gray-700 border-gray-300",
  中庸偽装型: "bg-yellow-50 text-yellow-700 border-yellow-200",
  単独運転型: "bg-lime-50 text-lime-700 border-lime-200",
};

export const TYPE_TONE_DEFAULT = "bg-slate-50 text-slate-700 border-slate-200";
