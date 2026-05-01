export type AxisKey = "A" | "B" | "C" | "D";
export type EmotionKey = "fear" | "sadness" | "anger" | "joy" | "happiness";

export const EMOTION_LABEL_JA: Record<EmotionKey, string> = {
  fear: "不安",
  sadness: "悲しみ",
  anger: "怒り",
  joy: "喜び",
  happiness: "幸福",
};

export const AXIS_LABEL_JA: Record<AxisKey, string> = {
  A: "動物的感情",
  B: "機械的感情",
  C: "動物的理性",
  D: "機械的理性",
};

export const AXIS_DESCRIPTION: Record<AxisKey, string> = {
  A: "感受性 / 即時の反応 / 共感",
  B: "承認 / 羞恥 / 社会的同調",
  C: "直感 / 経験圧縮 / 非言語的判断",
  D: "論理 / 分析 / 計画 / 説明",
};

export type AxisScores = Record<AxisKey, number>;
export type EmotionScores = Record<EmotionKey, number>;

export type QuadType =
  | "理詰め型"
  | "承認欲求型"
  | "ワガママ型"
  | "統合型"
  | "混合型";

export interface Diagnosis {
  date: string;
  scenario: "採用時" | "1年後";
  answers: Array<"A" | "B" | "C" | "D">;
  scores: AxisScores;
  emotions: EmotionScores;
  type: QuadType;
}

export interface Candidate {
  id: string;
  name: string;
  ageRange: string;
  gender: "男性" | "女性" | "その他";
  currentPosition: string;
  appliedPosition: string;
  presetTendency: "A優位" | "D優位" | "B優位";
  diagnoses: Diagnosis[];
}

export interface Question {
  id: string;
  text: string;
  options: { axis: AxisKey; label: string }[];
}
