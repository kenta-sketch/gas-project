"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AxisScores } from "@/lib/types";

interface Props {
  scores: AxisScores;
  comparison?: AxisScores;
  primaryLabel?: string;
  comparisonLabel?: string;
}

export function QuadRadar({
  scores,
  comparison,
  primaryLabel = "現在",
  comparisonLabel = "1年後",
}: Props) {
  const data = (["A", "B", "C", "D"] as const).map((axis) => ({
    axis,
    primary: scores[axis],
    ...(comparison ? { comparison: comparison[axis] } : {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#d1d5db" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 14, fontWeight: 700 }} />
        <PolarRadiusAxis angle={90} domain={[0, 25]} tick={{ fontSize: 11 }} />
        <Radar
          name={primaryLabel}
          dataKey="primary"
          stroke="#6e8fe8"
          fill="#6e8fe8"
          fillOpacity={0.35}
        />
        {comparison && (
          <Radar
            name={comparisonLabel}
            dataKey="comparison"
            stroke="#e87d6e"
            fill="#e87d6e"
            fillOpacity={0.25}
          />
        )}
        {comparison && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}
