import { QUESTIONS } from "./questions";
import type { AxisKey, AxisScores, QuadType, EmotionScores } from "./types";

const PER_QUESTION_POINTS = 25 / 9; // 9問×等重 → 各設問はおおよそ 2.78 点を 1 軸へ加算

export function computeAxisScores(answers: AxisKey[]): AxisScores {
  const scores: AxisScores = { A: 0, B: 0, C: 0, D: 0 };
  for (const axis of answers) {
    if (axis) scores[axis] += PER_QUESTION_POINTS;
  }
  // 0..25 へクランプし整数丸め
  (Object.keys(scores) as AxisKey[]).forEach((k) => {
    scores[k] = Math.max(0, Math.min(25, Math.round(scores[k])));
  });
  return scores;
}

export function judgeType(scores: AxisScores): QuadType {
  const { A, B, C, D } = scores;
  const max = Math.max(A, B, C, D);
  const min = Math.min(A, B, C, D);

  // 統合型: 全軸15以上かつ最大-最小<8
  if (A >= 15 && B >= 15 && C >= 15 && D >= 15 && max - min < 8) {
    return "統合型";
  }
  if (D === max && A < 12) return "理詰め型";
  if (B === max && C < 12) return "承認欲求型";
  if (A === max && B < 12) return "ワガママ型";
  return "混合型";
}

export function dominantAxis(scores: AxisScores): AxisKey {
  let best: AxisKey = "A";
  let max = -Infinity;
  (Object.keys(scores) as AxisKey[]).forEach((k) => {
    if (scores[k] > max) {
      max = scores[k];
      best = k;
    }
  });
  return best;
}

export function defaultEmotionScores(): EmotionScores {
  return { fear: 3, sadness: 3, anger: 3, joy: 3, happiness: 3 };
}

// 1年後シナリオ差分(デモ用簡易): 配置・環境ストレスに応じた典型的変化パターン
export interface YearLaterPattern {
  label: string;
  description: string;
  delta: AxisScores;
  emotionDelta: Partial<EmotionScores>;
}

export function suggestYearLaterPattern(
  scores: AxisScores,
  type: QuadType,
): YearLaterPattern {
  if (type === "理詰め型") {
    return {
      label: "適応進行(D偏重→統合方向)",
      description:
        "論理一辺倒だった姿勢から、現場で人間関係や直感判断が必要な場面を重ねて、A・Cが伸びてDが少し下がる典型的な統合パターン。",
      delta: { A: 4, B: 2, C: 3, D: -4 },
      emotionDelta: { fear: -1, joy: 1, happiness: 1 },
    };
  }
  if (type === "承認欲求型") {
    return {
      label: "自己軸の獲得(B偏重→C/A補強)",
      description:
        "他者評価に依存していた状態から、自分なりの判断基準が育ちつつある段階。Bが少し下がりCが伸びる、内的安定の指標。",
      delta: { A: 2, B: -3, C: 4, D: 1 },
      emotionDelta: { fear: -1, joy: 1, happiness: 1 },
    };
  }
  if (type === "ワガママ型") {
    return {
      label: "社会化進行(A偏重→B/D補強)",
      description:
        "感情主導から、組織の中で機能するためにB(他者調整)とD(計画性)が伸びる。Aは大きく失わずバランスが整う。",
      delta: { A: -2, B: 4, C: 1, D: 3 },
      emotionDelta: { anger: -1, joy: 1 },
    };
  }
  if (type === "統合型") {
    return {
      label: "統合の深化",
      description: "既に統合的だが、現業務でC(直感)がさらに磨かれる方向。",
      delta: { A: 1, B: 1, C: 3, D: 0 },
      emotionDelta: { happiness: 1 },
    };
  }
  return {
    label: "現職での緩やかな変化",
    description: "顕著な偏りがないため、現業務の特性に応じて軽微な変化が起こる想定。",
    delta: { A: 1, B: 1, C: 2, D: 1 },
    emotionDelta: { joy: 1 },
  };
}

export function applyDelta(base: AxisScores, delta: AxisScores): AxisScores {
  const out: AxisScores = { A: 0, B: 0, C: 0, D: 0 };
  (Object.keys(base) as AxisKey[]).forEach((k) => {
    out[k] = Math.max(0, Math.min(25, base[k] + delta[k]));
  });
  return out;
}

export function applyEmotionDelta(
  base: EmotionScores,
  delta: Partial<EmotionScores>,
): EmotionScores {
  const out: EmotionScores = { ...base };
  (Object.keys(delta) as (keyof EmotionScores)[]).forEach((k) => {
    const d = delta[k] ?? 0;
    out[k] = Math.max(1, Math.min(5, base[k] + d));
  });
  return out;
}
