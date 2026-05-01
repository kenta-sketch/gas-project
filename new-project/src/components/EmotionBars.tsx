"use client";

import { EMOTION_LABEL_JA } from "@/lib/types";
import type { EmotionScores } from "@/lib/types";

const COLORS: Record<keyof EmotionScores, string> = {
  fear: "#9ca3af",
  sadness: "#6b7280",
  anger: "#e87d6e",
  joy: "#e7b94d",
  happiness: "#7ec48f",
};

export function EmotionBars({ emotions }: { emotions: EmotionScores }) {
  const order: (keyof EmotionScores)[] = [
    "fear",
    "sadness",
    "anger",
    "joy",
    "happiness",
  ];
  return (
    <div className="space-y-3">
      {order.map((k) => {
        const v = emotions[k];
        const pct = (v / 5) * 100;
        return (
          <div key={k}>
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{EMOTION_LABEL_JA[k]}</span>
              <span className="font-mono text-xs text-gray-500">{v} / 5</span>
            </div>
            <div className="h-3 bg-gray-100 rounded">
              <div
                className="h-3 rounded transition-all"
                style={{ width: `${pct}%`, backgroundColor: COLORS[k] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
