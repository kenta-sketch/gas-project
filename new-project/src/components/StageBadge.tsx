"use client";

import { useEffect, useState } from "react";
import { loadSettings } from "@/lib/store";
import type { StageId } from "@/lib/types";

const STAGE_COLOR: Record<StageId, string> = {
  applied: "bg-blue-50 border-blue-200 text-blue-700",
  selection_1: "bg-amber-50 border-amber-200 text-amber-700",
  selection_2: "bg-amber-50 border-amber-300 text-amber-800",
  selection_final: "bg-purple-50 border-purple-200 text-purple-700",
  hired: "bg-emerald-50 border-emerald-200 text-emerald-700",
  rejected: "bg-rose-50 border-rose-200 text-rose-700",
};

export function StageBadge({ stage }: { stage: StageId }) {
  const [label, setLabel] = useState<string>(stage);
  useEffect(() => {
    const s = loadSettings();
    setLabel(s.stageLabels[stage]);
  }, [stage]);
  return (
    <span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + STAGE_COLOR[stage]}>
      {label}
    </span>
  );
}
