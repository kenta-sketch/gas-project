// クアッドマインド診断 採点エンジン v3.0
// 仕様: docs/theory/notes/2026-05-12-scoring-engine-v3.md
// 強制選択式 + 3スコア方式(Axis Score / Preference Score / Low Evidence Index) + マトリクス採点

import { SCORING_BY_QID, getScoringRecord } from "@/data/scoring-db-v3";
import {
  AXIS_QUESTIONS,
  A_SEPARATION_QUESTIONS,
  FZ_QUESTIONS,
  INTEGRATION_QUESTIONS,
  RESPONSIBILITY_QUESTIONS,
  ORG_RISK_QUESTIONS,
} from "./questions";
import type {
  AxisKey,
  AxisScores,
  EmotionScores,
  QuadType,
  DiagnosticAnswers,
  DiagnosticResult,
  ASeparation,
  AClassification,
  IntegrationDiagnosis,
  IntegrationStatus,
  ResponsibilityDiagnosis,
  ResponsibilityKind,
  OrgRiskDiagnosis,
  OrgRiskFlag,
  OrgRiskCategory,
  PreferenceScore,
  LowEvidenceIndex,
  NeutralFrequency,
  OptionId,
  ScoringRecord,
  TargetAxis,
  DiagnosticQuestion,
} from "./types";

// ============================================================
// クロス加点の重み (仕様書 第4章)
// ============================================================
const CROSS_WEIGHT = 0.7;       // 他軸質問のPrimary Axis加点
const CORE_WEIGHT = 1.5;        // コア質問の主軸加点(scoring DB weight=1.5)
const SUPPORT_WEIGHT = 1.0;     // 補助質問の主軸加点(scoring DB weight=1.0)
const REVERSE_WEIGHT = 1.0;     // 逆転項目(scoring DB weight=1.0)

// ============================================================
// 全回答を採点キーDBに突き合わせて、レコード列を返すヘルパー
// ============================================================
interface AnsweredRecord {
  qid: string;
  option: OptionId;
  record: ScoringRecord;
}

function collectAnswered(answers: DiagnosticAnswers): AnsweredRecord[] {
  const out: AnsweredRecord[] = [];
  const allMaps: Record<string, OptionId>[] = [
    answers.axis,
    answers.aSeparation,
    answers.integration,
    answers.responsibility,
    answers.orgRisk,
  ];
  for (const m of allMaps) {
    for (const qid of Object.keys(m)) {
      const opt = m[qid];
      const rec = getScoringRecord(qid, opt);
      if (rec) out.push({ qid, option: opt, record: rec });
    }
  }
  return out;
}

// ============================================================
// Axis Score (本人向け基本スコア・25点満点)
// 主軸質問でその軸の選択肢を選んだときの target_credit × weight を合計し、満点で正規化
// ============================================================
export function computeAxisScores(answered: AnsweredRecord[]): AxisScores {
  const axes: AxisKey[] = ["A", "B", "C", "D"];
  const out: AxisScores = { A: 0, B: 0, C: 0, D: 0 };

  for (const axis of axes) {
    let raw = 0;
    let max = 0;
    // この軸を測る質問群(target_axis === axis、Observerを除く)
    for (const ar of answered) {
      const r = ar.record;
      if (r.is_observer) continue;
      if (r.target_axis !== axis) continue;
      raw += r.weight * r.target_credit;
    }
    // 満点 = 各質問の(weight × 最大target_credit=1)の合計
    // 質問IDをユニーク化して計算
    const targetQids = new Set<string>();
    for (const rec of Object.values(SCORING_BY_QID)) {
      if (rec[0].target_axis === axis && !rec[0].is_observer) {
        targetQids.add(rec[0].question_id);
      }
    }
    for (const qid of targetQids) {
      const rec = SCORING_BY_QID[qid];
      if (rec) max += rec[0].weight; // weight × 1 (最大target_credit)
    }
    out[axis] = max > 0 ? Math.round((raw / max) * 25 * 10) / 10 : 0;
  }
  return out;
}

// ============================================================
// Preference Score (反応スタイル・全質問通算)
// 各選択肢の primary_axis に basedで、重み付き加点する
// 主軸質問で当該軸 → CORE_WEIGHT / SUPPORT_WEIGHT
// 他軸質問で当該軸 → CROSS_WEIGHT
// is_observer / is_neutral / is_diagnostic_null は除外
// ============================================================
export function computePreferenceScore(answered: AnsweredRecord[]): PreferenceScore {
  const out: PreferenceScore = { A: 0, B: 0, C: 0, D: 0 };
  for (const ar of answered) {
    const r = ar.record;
    if (r.is_observer) continue;
    if (r.is_neutral) continue;
    if (r.is_diagnostic_null) continue;
    const pa = r.primary_axis;
    if (pa !== "A" && pa !== "B" && pa !== "C" && pa !== "D") continue;

    // 主軸質問か他軸質問かで重みを変える
    const targetIsAxis = r.target_axis === pa;
    const weight = targetIsAxis ? r.weight : CROSS_WEIGHT;
    out[pa] += weight;
  }
  // 小数1桁に丸める
  (Object.keys(out) as AxisKey[]).forEach((k) => {
    out[k] = Math.round(out[k] * 10) / 10;
  });
  return out;
}

// ============================================================
// Low Evidence Index (内部判定用・25点満点)
// 各軸の逆転項目の Low Evidence × weight を合計し、満点で正規化
// is_neutral=1 は除外、is_diagnostic_null=1 は含む
// ============================================================
export function computeLowEvidenceIndex(answered: AnsweredRecord[]): LowEvidenceIndex {
  const axes: AxisKey[] = ["A", "B", "C", "D"];
  const out: LowEvidenceIndex = { A: 0, B: 0, C: 0, D: 0 };

  for (const axis of axes) {
    let raw = 0;
    let max = 0;

    // 該当軸の逆転項目を集計
    const reverseQids = new Set<string>();
    for (const recs of Object.values(SCORING_BY_QID)) {
      const r0 = recs[0];
      if (r0.target_axis === axis && r0.is_reverse) {
        reverseQids.add(r0.question_id);
      }
    }

    for (const ar of answered) {
      const r = ar.record;
      if (!r.is_reverse) continue;
      if (r.is_neutral) continue;
      if (r.target_axis !== axis) continue;
      raw += r.weight * r.low_evidence;
    }
    for (const qid of reverseQids) {
      const rec = SCORING_BY_QID[qid];
      if (rec) max += rec[0].weight;
    }
    out[axis] = max > 0 ? Math.round((raw / max) * 25 * 10) / 10 : 0;
  }
  return out;
}

// ============================================================
// Neutral Frequency
// ============================================================
export function computeNeutralFrequency(answered: AnsweredRecord[]): NeutralFrequency {
  let total = 0;
  const byTargetAxis: Partial<Record<TargetAxis, number>> = {};
  let aTotal = 0;
  let aNeutral = 0;

  for (const ar of answered) {
    if (ar.record.is_neutral) {
      total++;
      const t = ar.record.target_axis;
      byTargetAxis[t] = (byTargetAxis[t] ?? 0) + 1;
    }
    if (ar.record.target_axis === "A") {
      aTotal++;
      if (ar.record.is_neutral) aNeutral++;
    }
  }

  const totalAnswered = answered.length;
  const totalPct = totalAnswered > 0 ? (total / totalAnswered) * 100 : 0;
  const aNeutralPct = aTotal > 0 ? (aNeutral / aTotal) * 100 : 0;

  return {
    total,
    totalPct: Math.round(totalPct * 10) / 10,
    byTargetAxis,
    flagAll30: totalPct >= 30,
    flagANeutral50: aNeutralPct >= 50,
  };
}

// ============================================================
// G2: A発火/A表出分離 (25点満点)
// ============================================================
export function computeASeparation(answered: AnsweredRecord[]): ASeparation {
  // 内的A = target_axis = "iA" の target_credit 加重平均
  // 表出A = target_axis = "eA" の target_credit 加重平均
  const sumByTarget = (targetAxis: TargetAxis): number => {
    let raw = 0;
    let max = 0;
    const qids = new Set<string>();
    for (const recs of Object.values(SCORING_BY_QID)) {
      if (recs[0].target_axis === targetAxis) qids.add(recs[0].question_id);
    }
    for (const ar of answered) {
      if (ar.record.target_axis !== targetAxis) continue;
      raw += ar.record.weight * ar.record.target_credit;
    }
    for (const qid of qids) {
      const rec = SCORING_BY_QID[qid];
      if (rec) max += rec[0].weight;
    }
    return max > 0 ? (raw / max) * 25 : 0;
  };

  const internal = Math.round(sumByTarget("iA") * 10) / 10;
  const external = Math.round(sumByTarget("eA") * 10) / 10;

  // FZ判定: FZ問題が回答されていて、target_credit加重平均が高い
  const fzAnswers = answered.filter((a) => a.record.target_axis === "FZ");
  let fzRaw = 0;
  let fzMax = 0;
  const fzQids = new Set<string>();
  for (const recs of Object.values(SCORING_BY_QID)) {
    if (recs[0].target_axis === "FZ") fzQids.add(recs[0].question_id);
  }
  for (const ar of fzAnswers) {
    fzRaw += ar.record.weight * ar.record.target_credit;
  }
  for (const qid of fzQids) {
    const rec = SCORING_BY_QID[qid];
    if (rec) fzMax += rec[0].weight;
  }
  const fzNormalized = fzMax > 0 ? (fzRaw / fzMax) * 25 : 0;
  const frozen = fzAnswers.length >= 2 && fzNormalized >= 15;

  const INTERNAL_THRESHOLD = 13;
  const EXTERNAL_THRESHOLD = 13;

  let classification: AClassification;
  if (internal < INTERNAL_THRESHOLD && external < EXTERNAL_THRESHOLD) {
    classification = "真性A低";
  } else if (internal >= INTERNAL_THRESHOLD && external < EXTERNAL_THRESHOLD) {
    classification = frozen ? "A凍結型" : "A抑圧型";
  } else if (internal >= INTERNAL_THRESHOLD && external >= EXTERNAL_THRESHOLD) {
    classification = "A管理型";
  } else {
    classification = "演技的表出フラグ";
  }

  return { internal, external, classification, frozen };
}

// ============================================================
// G4: 統合状態 (Observer + Switch、A/B/C/D に交絡しない)
// ============================================================
export function computeIntegration(
  answered: AnsweredRecord[],
  axisScores: AxisScores,
): IntegrationDiagnosis {
  const scoreFor = (targetAxis: TargetAxis): number => {
    let raw = 0;
    let max = 0;
    const qids = new Set<string>();
    for (const recs of Object.values(SCORING_BY_QID)) {
      if (recs[0].target_axis === targetAxis) qids.add(recs[0].question_id);
    }
    for (const ar of answered) {
      if (ar.record.target_axis !== targetAxis) continue;
      raw += ar.record.weight * ar.record.target_credit;
    }
    for (const qid of qids) {
      const rec = SCORING_BY_QID[qid];
      if (rec) max += rec[0].weight;
    }
    return max > 0 ? (raw / max) * 25 : 0;
  };

  const observerScore = Math.round(scoreFor("OB") * 10) / 10;
  const switchScore = Math.round(scoreFor("SW") * 10) / 10;
  const index = (observerScore + switchScore) / 2;

  const allAxes = [axisScores.A, axisScores.B, axisScores.C, axisScores.D];
  const allBalanced = allAxes.every((v) => v >= 13);
  const anyLow = allAxes.some((v) => v < 10);
  const max = Math.max(...allAxes);
  const min = Math.min(...allAxes);
  const isBalanced = max - min < 8;

  let status: IntegrationStatus;
  if (index >= 20 && allBalanced) {
    status = "本物の統合";
  } else if (index >= 20 && anyLow) {
    status = "部分統合";
  } else if (index < 15 && isBalanced) {
    status = "偽の中庸";
  } else {
    status = "単独運転";
  }

  return { observerScore, switchScore, index, status };
}

// ============================================================
// G3: 責任感の3形態 (各3問、最高型を主、差3点未満は複合型)
// 各 target_axis (DR / BR / AR) の target_credit 合計
// ============================================================
export function computeResponsibility(answered: AnsweredRecord[]): ResponsibilityDiagnosis {
  const sumFor = (targetAxis: TargetAxis): number => {
    let s = 0;
    for (const ar of answered) {
      if (ar.record.target_axis !== targetAxis) continue;
      s += ar.record.weight * ar.record.target_credit;
    }
    return Math.round(s * 10) / 10;
  };

  const scores: Record<ResponsibilityKind, number> = {
    D型: sumFor("DR"),
    B型: sumFor("BR"),
    A型: sumFor("AR"),
  };

  const sorted = (Object.keys(scores) as ResponsibilityKind[]).sort(
    (a, b) => scores[b] - scores[a],
  );
  const primary = sorted[0];
  const secondary = sorted[1];
  // 各型最大3点なので差0.5未満で複合型
  const isCompound = Math.abs(scores[primary] - scores[secondary]) < 0.5;

  return {
    scores,
    primary,
    secondary: isCompound ? secondary : undefined,
    isCompound,
  };
}

// ============================================================
// G5: 組織毀損プロファイル (各3問。閾値超過でフラグ)
// ============================================================
function riskCategory(
  category: OrgRiskCategory,
  targetAxis: TargetAxis,
  answered: AnsweredRecord[],
): OrgRiskFlag | null {
  let score = 0;
  for (const ar of answered) {
    if (ar.record.target_axis !== targetAxis) continue;
    score += ar.record.weight * ar.record.target_credit;
  }
  score = Math.round(score * 10) / 10;
  // 各3問・各最大1点 = 0〜3点
  let level: "low" | "medium" | "high";
  if (score >= 2.5) level = "high";
  else if (score >= 1.5) level = "medium";
  else return null;
  return { category, score, level };
}

export function computeOrgRisk(answered: AnsweredRecord[]): OrgRiskDiagnosis {
  const flags: OrgRiskFlag[] = [];
  const ag = riskCategory("承認略奪型", "AG", answered);
  const rv = riskCategory("ルール暴力型", "RV", answered);
  const im = riskCategory("衝動暴走型", "IM", answered);
  if (ag) flags.push(ag);
  if (rv) flags.push(rv);
  if (im) flags.push(im);
  return { flags, hasAnyRisk: flags.length > 0 };
}

// ============================================================
// G6: 12タイプ判定(優先順位付き)
// ============================================================
export function judgeType(
  scores: AxisScores,
  aSep: ASeparation,
  integration: IntegrationDiagnosis,
  _orgRisk: OrgRiskDiagnosis,
): QuadType {
  // 1. A凍結フラグは最優先
  if (aSep.classification === "A凍結型") return "A凍結型";
  if (aSep.classification === "A抑圧型") return "A抑圧型";

  // 2. 統合状態
  if (integration.status === "本物の統合") return "統合型";
  if (integration.status === "偽の中庸") return "中庸偽装型";

  // 3. 単独運転(一軸突出 + 他が低い)
  const sorted = (Object.keys(scores) as AxisKey[]).sort(
    (a, b) => scores[b] - scores[a],
  );
  const top = sorted[0];
  const second = sorted[1];
  const minVal = scores[sorted[3]];
  if (scores[top] >= 20 && minVal < 10) {
    return "単独運転型";
  }

  // 4. 主軸×副軸での6タイプ分類
  const combo = `${top}+${second}`;
  switch (combo) {
    case "A+C": return "突破型";
    case "B+C": return "共感型";
    case "D+C": return "設計型";
    case "B+D": return "忠実型";
    case "C+A": return "直感型";
    case "D+B": return "分析型";
    case "C+B": return "蓄積型";
  }

  // フォールバック
  if (top === "A") return "突破型";
  if (top === "B") return "共感型";
  if (top === "C") return "直感型";
  return "設計型";
}

// ============================================================
// 統合: 全診断結果を一気に計算
// ============================================================
export function computeFullDiagnosis(
  answers: DiagnosticAnswers,
  emotions: EmotionScores,
): DiagnosticResult {
  const answered = collectAnswered(answers);
  const scores = computeAxisScores(answered);
  const preference = computePreferenceScore(answered);
  const lowEvidence = computeLowEvidenceIndex(answered);
  const neutral = computeNeutralFrequency(answered);
  const aSeparation = computeASeparation(answered);
  const integration = computeIntegration(answered, scores);
  const responsibility = computeResponsibility(answered);
  const orgRisk = computeOrgRisk(answered);
  const primaryType = judgeType(scores, aSeparation, integration, orgRisk);
  return {
    scores,
    preference,
    lowEvidence,
    neutral,
    emotions,
    aSeparation,
    integration,
    responsibility,
    orgRisk,
    primaryType,
  };
}

// ============================================================
// ユーティリティ
// ============================================================
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

// 旧 Q1-Q9 互換
export function legacyComputeAxisScores(): AxisScores {
  return { A: 0, B: 0, C: 0, D: 0 };
}

// ============================================================
// 1年後パターン
// ============================================================
export interface YearLaterPattern {
  label: string;
  description: string;
  delta: AxisScores;
  emotionDelta: Partial<EmotionScores>;
}

export function suggestYearLaterPattern(
  _scores: AxisScores,
  type: QuadType,
): YearLaterPattern {
  if (type === "突破型") {
    return {
      label: "突破→統合進化",
      description: "Aの熱量にCの精度が乗り、突破型から統合型への進化が見えている。",
      delta: { A: -1, B: 3, C: 3, D: 4 },
      emotionDelta: { joy: 1, happiness: 1 },
    };
  }
  if (type === "共感型") {
    return {
      label: "自己軸の獲得",
      description: "B依存から自己軸が育ち、C/Dとのバランスが取れてきた。",
      delta: { A: 2, B: -2, C: 3, D: 2 },
      emotionDelta: { fear: -1, joy: 1 },
    };
  }
  if (type === "設計型") {
    return {
      label: "感情接続の獲得",
      description: "Dの精度にA/Cが補強され、人との関係性も含めた設計ができるようになった。",
      delta: { A: 4, B: 2, C: 3, D: -2 },
      emotionDelta: { joy: 1, happiness: 1 },
    };
  }
  if (type === "A抑圧型") {
    return {
      label: "解放方向への進化",
      description: "安全な表出環境でAを解放しつつあり、B依存も和らいできた。",
      delta: { A: 3, B: -2, C: 2, D: 1 },
      emotionDelta: { fear: -2, joy: 2 },
    };
  }
  if (type === "統合型") {
    return {
      label: "統合の深化",
      description: "Cがさらに磨かれ、現場判断の精度が上がっている。",
      delta: { A: 1, B: 1, C: 3, D: 1 },
      emotionDelta: { happiness: 1 },
    };
  }
  return {
    label: "緩やかな進化",
    description: "現業務での経験を通じた典型的変化。",
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

// 未使用だが互換のため exports
export const _unusedAxisQuestionsImport = AXIS_QUESTIONS.length;
export const _unusedASepImport = A_SEPARATION_QUESTIONS.length;
export const _unusedFZImport = FZ_QUESTIONS.length;
export const _unusedIntImport = INTEGRATION_QUESTIONS.length;
export const _unusedRespImport = RESPONSIBILITY_QUESTIONS.length;
export const _unusedRiskImport = ORG_RISK_QUESTIONS.length;
type _q = DiagnosticQuestion;
