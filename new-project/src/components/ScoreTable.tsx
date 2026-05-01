import { AXIS_LABEL_JA, AXIS_DESCRIPTION } from "@/lib/types";
import type { AxisKey, AxisScores } from "@/lib/types";

const AXIS_COLOR: Record<AxisKey, string> = {
  A: "bg-quad-a",
  B: "bg-quad-b",
  C: "bg-quad-c",
  D: "bg-quad-d",
};

export function ScoreTable({ scores }: { scores: AxisScores }) {
  return (
    <div className="space-y-2">
      {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
        const v = scores[k];
        const pct = (v / 25) * 100;
        return (
          <div key={k} className="bg-white border border-quad-line rounded p-3">
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <span className={"inline-block w-6 h-6 rounded text-white font-bold text-center " + AXIS_COLOR[k]}>
                  {k}
                </span>
                <span className="font-bold">{AXIS_LABEL_JA[k]}</span>
                <span className="text-xs text-gray-500">{AXIS_DESCRIPTION[k]}</span>
              </div>
              <span className="font-mono text-sm font-bold">{v} / 25</span>
            </div>
            <div className="h-2 bg-gray-100 rounded">
              <div
                className={"h-2 rounded transition-all " + AXIS_COLOR[k]}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
