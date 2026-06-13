// クアッドマインド診断 採点ロジック(完全仕様書 v1.0 準拠)
// 出典: docs/theory/notes/2026-05-11-diagnostic-spec-v1.md

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
  DiagnosticQuestion,
  LikertValue,
  ResponseStyle,
  ResponseStyleProfile,
  NeutralFrequencyV1,
  AxisCorrelationCorrection,
  ResponseTimings,
  // v2.0(2026-06-13)
  AllianceDiagnosis,
  AllianceFlag,
  AllianceKind,
  PlatformDiagnosis,
  BcInsightScore,
  OverObserverDiagnosis,
} from "./types";

// ============================================================
// 共通: 重み付きスコア計算 + 25点満点への正規化
// ============================================================
function weightedSum(
  questions: DiagnosticQuestion[],
  answers: Record<string, LikertValue>,
): { raw: number; max: number } {
  let raw = 0;
  let max = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined) continue;
    const reversed = q.kind === "reverse" ? 6 - a : a;
    raw += reversed * q.weight;
    max += 5 * q.weight;
  }
  return { raw, max };
}

function scaleTo(rawSum: { raw: number; max: number }, target: number): number {
  if (rawSum.max === 0) return 0;
  return Math.round((rawSum.raw / rawSum.max) * target);
}

// ============================================================
// A軸〜D軸スコア(25点満点)
// ============================================================
export function computeAxisScores(answers: DiagnosticAnswers): AxisScores {
  const result: AxisScores = { A: 0, B: 0, C: 0, D: 0 };
  (["A", "B", "C", "D"] as AxisKey[]).forEach((axis) => {
    const qs = AXIS_QUESTIONS.filter((q) => q.category === `axis_${axis}`);
    result[axis] = scaleTo(weightedSum(qs, answers.axis), 25);
  });
  return result;
}

// ============================================================
// 情熱(自分の感情)の内外分離(v2.0)
// 内側(A-1〜A-3): axis フィールドから
// 外側(A-4, A-5): axis フィールドから
// 抑圧判定(AS-1, AS-2): aSeparation フィールドから
// 凍結判別(FZ-1, FZ-2): aSeparation フィールドから
// ============================================================
export function computeASeparation(answers: DiagnosticAnswers): ASeparation {
  // 内的A(自分の中の感情): A-1, A-2, A-3 (axis_A の core)
  const iAQs = AXIS_QUESTIONS.filter(
    (q) => q.category === "axis_A" && ["A-1", "A-2", "A-3"].includes(q.id),
  );
  // 表出A(外に出せる): A-4, A-5
  const eAQs = AXIS_QUESTIONS.filter(
    (q) => q.category === "axis_A" && ["A-4", "A-5"].includes(q.id),
  );
  const internal = scaleTo(weightedSum(iAQs, answers.axis), 25);
  const external = scaleTo(weightedSum(eAQs, answers.axis), 25);

  // 抑圧判定: AS-1(人前ではできない), AS-2(後から悔やむ) の平均
  const asValues = ["AS-1", "AS-2"]
    .map((id) => answers.aSeparation[id])
    .filter((v): v is LikertValue => v !== undefined);
  const asAvg = asValues.length > 0 ? asValues.reduce((s, v) => s + v, 0) / asValues.length : 0;

  // 凍結判別: FZ-1(何も感じない) の値が主
  const fz1 = answers.aSeparation["FZ-1"] ?? 0;
  const fz2 = answers.aSeparation["FZ-2"] ?? 0;
  // 凍結 = FZ-1 高い かつ FZ-2 低い(沈黙時に感じてない)
  const frozen = fz1 >= 4 && fz2 <= 2;

  let classification: AClassification;
  const INTERNAL_THRESHOLD = 13;
  const EXTERNAL_THRESHOLD = 13;
  const SUPPRESSION_THRESHOLD = 3.5;

  if (internal < INTERNAL_THRESHOLD && external < EXTERNAL_THRESHOLD) {
    // 内側も外側も弱い → 真性A低 or 凍結
    classification = frozen ? "A凍結型" : "真性A低";
  } else if (internal >= INTERNAL_THRESHOLD && external < EXTERNAL_THRESHOLD) {
    // 内側強い・外側弱い → 抑圧 or 凍結
    if (frozen) classification = "A凍結型";
    else if (asAvg >= SUPPRESSION_THRESHOLD) classification = "A抑圧型";
    else classification = "A抑圧型"; // 軽度でも抑圧として扱う
  } else if (internal >= INTERNAL_THRESHOLD && external >= EXTERNAL_THRESHOLD) {
    classification = "A管理型";
  } else {
    classification = "演技的表出フラグ";
  }

  return { internal, external, classification, frozen };
}

// ============================================================
// 気づきの力(Observer)v2.0
// OB-1〜OB-5(5問)を 30点満点に正規化。Switch廃止、Index は Observer単独。
// 過剰Observer(OD-1, OD-2)は別関数 computeOverObserver で計算。
// ============================================================
export function computeIntegration(
  answers: DiagnosticAnswers,
  axisScores: AxisScores,
): IntegrationDiagnosis {
  const obQs = INTEGRATION_QUESTIONS.filter((q) => q.category === "OB");
  // 30点満点に正規化(OB 5問・重み合計 7.5、5*7.5=37.5 → 30に変換)
  const observerScore = scaleTo(weightedSum(obQs, answers.integration), 30);
  // Switch は廃止、互換のため同じスコアを使用
  const switchScore = observerScore;
  // 統合指数 = Observer 単独
  const index = observerScore;

  const allAxes = [axisScores.A, axisScores.B, axisScores.C, axisScores.D];
  const allBalanced = allAxes.every((v) => v >= 13);
  const anyLow = allAxes.some((v) => v < 10);
  const max = Math.max(...allAxes);
  const min = Math.min(...allAxes);
  const isBalanced = max - min < 8;

  let status: IntegrationStatus;
  if (index >= 22 && allBalanced) {
    status = "本物の統合";
  } else if (index >= 18 && anyLow) {
    status = "部分統合";
  } else if (index < 15 && isBalanced) {
    status = "偽の中庸";
  } else {
    status = "単独運転";
  }

  return { observerScore, switchScore, index, status };
}

// ============================================================
// 過剰Observer(考えすぎ状態)v2.0 新規
// OD-1, OD-2 の平均が 3.5 以上で「考えすぎ」フラグ
// ============================================================
export function computeOverObserver(answers: DiagnosticAnswers): OverObserverDiagnosis {
  const values = ["OD-1", "OD-2"]
    .map((id) => answers.integration[id])
    .filter((v): v is LikertValue => v !== undefined);
  const level = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const flag = level >= 3.5;
  let note: string;
  if (level >= 4) note = "監視しすぎで動けない傾向が強い。情報を絞る訓練が必要。";
  else if (level >= 3) note = "やや考えすぎる傾向。決断期限を構造的に設けると楽になる。";
  else note = "適度。判断と行動のバランスが取れている。";
  return { level: Math.round(level * 10) / 10, flag, note };
}

// ============================================================
// 人を読む力(対人カン・B由来C)v2.0 新規
// BC-1〜BC-4 が主、BC-5 が逆指標(歪曲度)
// ============================================================
export function computeBcInsight(answers: DiagnosticAnswers): BcInsightScore {
  const coreQs = AXIS_QUESTIONS.filter(
    (q) => q.category === "axis_BC" && ["BC-1", "BC-2", "BC-3", "BC-4"].includes(q.id),
  );
  const score = scaleTo(weightedSum(coreQs, answers.axis), 25);
  const distortion = answers.axis["BC-5"] ?? 0;
  let status: "healthy" | "distorted" | "low";
  if (score >= 17 && distortion <= 3) status = "healthy";
  else if (score >= 13 && distortion >= 4) status = "distorted";
  else if (score < 13) status = "low";
  else status = "healthy";
  return { score, distortion, status };
}

// ============================================================
// 強みのペア・組み合わせクセ(エンジン同盟)v2.0 新規
// 4ペア × 2問。各ペアの平均が 4.0以上で strong / 3.0以上で medium
// ============================================================
const ALLIANCE_LABELS: Record<AllianceKind, string> = {
  AL_BD: "関係 × 論理(「正しさで自分を縛る」クセ)",
  AL_AC: "情熱 × 洞察(「感覚と経験で押し切る」クセ)",
  AL_BC: "関係 × 洞察(「空気と経験で本音を出さない」クセ)",
  AL_AB: "情熱 × 関係(「感情と承認で振り回される」クセ)",
};

export function computeAlliances(answers: DiagnosticAnswers): AllianceDiagnosis {
  const flags: AllianceFlag[] = [];
  const pairs: { kind: AllianceKind; ids: string[] }[] = [
    { kind: "AL_BD", ids: ["AL-BD1", "AL-BD2"] },
    { kind: "AL_AC", ids: ["AL-AC1", "AL-AC2"] },
    { kind: "AL_BC", ids: ["AL-BC1", "AL-BC2"] },
    { kind: "AL_AB", ids: ["AL-AB1", "AL-AB2"] },
  ];
  for (const { kind, ids } of pairs) {
    const values = ids
      .map((id) => answers.responsibility[id])
      .filter((v): v is LikertValue => v !== undefined);
    if (values.length === 0) continue;
    const strength = values.reduce((s, v) => s + v, 0) / values.length;
    let level: "weak" | "medium" | "strong";
    if (strength >= 4.0) level = "strong";
    else if (strength >= 3.0) level = "medium";
    else level = "weak";
    if (level !== "weak") {
      flags.push({
        kind,
        label: ALLIANCE_LABELS[kind],
        strength: Math.round(strength * 10) / 10,
        level,
      });
    }
  }
  return { flags, hasStrongPair: flags.some((f) => f.level === "strong") };
}

// ============================================================
// コンディション(身体・睡眠・Platform層)v2.0 新規
// PL-1(睡眠)+ PL-2(身体感覚)
// ============================================================
export function computePlatform(answers: DiagnosticAnswers): PlatformDiagnosis {
  const pl1 = answers.orgRisk["PL-1"] ?? 0; // 睡眠十分か
  const pl2 = answers.orgRisk["PL-2"] ?? 0; // 身体感覚に気づきやすいか
  const score = pl1 + pl2; // 0-10
  let status: "good" | "warn" | "low";
  let note: string;
  if (score >= 8) {
    status = "good";
    note = "心理機能を支える土台が整っている。Observerもエンジンも本来のパフォーマンスを発揮できる。";
  } else if (score >= 5) {
    status = "warn";
    note = "土台がやや弱い。睡眠と身体ケアを優先することで判断と気づきが安定する。";
  } else {
    status = "low";
    note = "土台が崩れている。心理ワークより先に身体の回復が最優先。";
  }
  return { score, status, note };
}

// ============================================================
// 旧 G3 責任感(v2.0で廃止、後方互換のため空ダミーを返す)
// 古い Diagnosis レコード/UIで参照されている可能性があるため残置。
// 新しい意味は computeAlliances(強みのペア)に移行。
// ============================================================
export function computeResponsibility(
  _answers: DiagnosticAnswers,
): ResponsibilityDiagnosis {
  return {
    scores: { D型: 0, B型: 0, A型: 0 },
    primary: "D型" as ResponsibilityKind,
    secondary: undefined,
    isCompound: false,
  };
}

// ============================================================
// 旧 G5 組織毀損(v2.0で廃止、後方互換のため空ダミーを返す)
// ============================================================
export function computeOrgRisk(_answers: DiagnosticAnswers): OrgRiskDiagnosis {
  return { flags: [], hasAnyRisk: false };
}

// ============================================================
// G6: 12タイプ判定(優先順位付き)
// ============================================================
export function judgeType(
  scores: AxisScores,
  aSep: ASeparation,
  integration: IntegrationDiagnosis,
  orgRisk: OrgRiskDiagnosis,
): QuadType {
  // 1. 癌候補フラグは最優先(注: 本人向け出力ではこの型名を見せない)
  //    high レベルの組織毀損があれば、専門的ラベルとして残す
  //    ※ 実際の表示は呼び出し側で「内部出力」と「外部出力」を分ける

  // 2. A発火/表出の乖離(A抑圧/A凍結が高優先)
  if (aSep.classification === "A凍結型") return "A凍結型";
  if (aSep.classification === "A抑圧型") return "A抑圧型";

  // 3. 統合状態
  if (integration.status === "本物の統合") return "統合型";
  if (integration.status === "偽の中庸") return "中庸偽装型";

  // 4. 単独運転(一軸突出 + 他が低い)
  const sorted = (Object.keys(scores) as AxisKey[]).sort(
    (a, b) => scores[b] - scores[a],
  );
  const top = sorted[0];
  const second = sorted[1];
  const minVal = scores[sorted[3]];
  if (scores[top] >= 20 && minVal < 10) {
    return "単独運転型";
  }

  // 5. 主軸×副軸での6タイプ分類
  // 突破型: A主軸 + C副軸
  // 共感型: B主軸 + C副軸
  // 設計型: D主軸 + C副軸
  // 忠実型: B主軸 + D副軸
  // 直感型: C主軸 + A副軸
  // 分析型: D主軸 + B副軸
  // 蓄積型: C主軸 + B副軸
  const combo = `${top}+${second}`;
  switch (combo) {
    case "A+C":
      return "突破型";
    case "B+C":
      return "共感型";
    case "D+C":
      return "設計型";
    case "B+D":
      return "忠実型";
    case "C+A":
      return "直感型";
    case "D+B":
      return "分析型";
    case "C+B":
      return "蓄積型";
  }

  // フォールバック: 主軸ベースで最も近い
  if (top === "A") return "突破型";
  if (top === "B") return "共感型";
  if (top === "C") return "直感型";
  return "設計型";
}

// ============================================================
// 統合: 全診断結果を一気に計算
// ============================================================
// ============================================================
// 【第2層変数】Response Style Profile
// 122人実証分析(2026-05-12)から導入。Likert加点方式のバイアスを補正する
//
// 全回答の分布から穏当/識別/極端/中立/同意/否定型に分類する。
// 同じ得点でも回答スタイルで内的意味が違うため、タイプ判定の補助材料として使う。
// ============================================================
export function computeResponseStyle(answers: DiagnosticAnswers): ResponseStyleProfile {
  // 全カテゴリから全Likert値を集める
  const values: number[] = [];
  for (const cat of [answers.axis, answers.aSeparation, answers.integration, answers.responsibility, answers.orgRisk]) {
    for (const v of Object.values(cat)) {
      if (typeof v === "number") values.push(v);
    }
  }
  const total = values.length;
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const v of values) {
    if (v >= 1 && v <= 5) {
      distribution[v as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }

  const mean = total > 0 ? values.reduce((s, v) => s + v, 0) / total : 0;
  const variance = total > 0 ? values.reduce((s, v) => s + (v - mean) ** 2, 0) / total : 0;
  const sd = Math.sqrt(variance);

  const extremeRatio = total > 0 ? (distribution[1] + distribution[5]) / total : 0;
  const neutralRatio = total > 0 ? distribution[3] / total : 0;
  const midRatio = total > 0 ? (distribution[2] + distribution[4]) / total : 0;
  const acquiescenceBias = mean - 3.0; // 中央3を基準

  let style: ResponseStyle = "Discriminant";
  if (extremeRatio >= 0.5) style = "Extreme";
  else if (neutralRatio >= 0.4) style = "Neutral";
  else if (midRatio >= 0.6) style = "Modest";
  else if (mean >= 4.0) style = "Acquiescence";
  else if (mean <= 2.0) style = "Disacquiescence";

  const warnings: string[] = [];
  if (style === "Neutral") warnings.push("中立(3)の選択が多く、軸スコアの差が出にくい可能性");
  if (style === "Extreme") warnings.push("極端な値(1か5)が多く、強く出すぎている可能性");
  if (style === "Acquiescence") warnings.push("同意傾向が強く、社会的望ましさバイアスの影響を考慮");
  if (style === "Modest" && acquiescenceBias > 0.5) warnings.push("穏当だがやや同意寄り");

  return {
    style,
    distribution,
    mean: Math.round(mean * 100) / 100,
    sd: Math.round(sd * 100) / 100,
    extremeRatio: Math.round(extremeRatio * 1000) / 1000,
    neutralRatio: Math.round(neutralRatio * 1000) / 1000,
    midRatio: Math.round(midRatio * 1000) / 1000,
    acquiescenceBias: Math.round(acquiescenceBias * 100) / 100,
    warnings,
  };
}

// ============================================================
// 【第2層変数】Neutral Frequency
// 中立(3)を選ぶ頻度。v3.0仕様書の概念をLikertに適用
// 30%超で解離・無感覚フラグの判定材料
// ============================================================
export function computeNeutralFrequency(answers: DiagnosticAnswers): NeutralFrequencyV1 {
  let count = 0;
  let total = 0;
  for (const cat of [answers.axis, answers.aSeparation, answers.integration, answers.responsibility, answers.orgRisk]) {
    for (const v of Object.values(cat)) {
      total += 1;
      if (v === 3) count += 1;
    }
  }
  const ratio = total > 0 ? count / total : 0;
  return {
    count,
    total,
    ratio: Math.round(ratio * 1000) / 1000,
    highFlag: ratio > 0.30,
  };
}

// ============================================================
// 【第2層変数】軸間相関補正
// 122人実証データから判明した軸間相関を使い、純粋成分を推定する
//
// 観測された主な相関:
//   C-D: +0.37 (強い正相関、賢さ次元として一緒に動く)
//   A-D: -0.20 (感情と理性の対立)
//   B-C: -0.18 (承認依存と直感は逆方向)
//   A-B: +0.18 (感情系同士で弱く連動)
//
// 純粋成分の推定式 (簡易版):
//   pureC = C - r_CD * D_normalized
//   pureD = D - r_CD * C_normalized
//   adjustedA = A * (1 + |r_AD|/2) (A-D 負相関を考慮し、Dと相反する方向のAを強調)
//   adjustedB = B * (1 + |r_BC|/2)
// ============================================================
export function computeAxisCorrelationCorrection(scores: AxisScores): AxisCorrelationCorrection {
  const CORR_CD = 0.37;
  const CORR_AD = -0.20;
  const CORR_BC = -0.18;

  // 25点満点でセンタリング(平均値17を基準にする、122人データから)
  const MEAN = 17.0;
  const centered = {
    A: scores.A - MEAN,
    B: scores.B - MEAN,
    C: scores.C - MEAN,
    D: scores.D - MEAN,
  };

  // C-D の共通成分を引いて、純粋成分を推定
  const pureC = MEAN + centered.C - CORR_CD * centered.D;
  const pureD = MEAN + centered.D - CORR_CD * centered.C;
  // A-D が負相関なので、Dが低いときAを少し強める(逆も)
  const adjustedA = MEAN + centered.A * (1 + Math.abs(CORR_AD) / 2);
  // B-C が負相関なので、Cが低いときBを少し強める
  const adjustedB = MEAN + centered.B * (1 + Math.abs(CORR_BC) / 2);

  const round1 = (v: number) => Math.round(v * 10) / 10;

  return {
    pureC: round1(pureC),
    pureD: round1(pureD),
    adjustedA: round1(adjustedA),
    adjustedB: round1(adjustedB),
    notes: [
      `C-D相関 +0.37: pureC=${round1(pureC)} (生C=${round1(scores.C)})、pureD=${round1(pureD)} (生D=${round1(scores.D)})`,
      `A-D相関 -0.20: adjustedA=${round1(adjustedA)} (生A=${round1(scores.A)})`,
      `B-C相関 -0.18: adjustedB=${round1(adjustedB)} (生B=${round1(scores.B)})`,
    ],
  };
}

// ============================================================
// 【第2層変数】回答時間プロファイル
// クライアントから渡される質問IDごとの回答時間(ms)を集計
// ============================================================
export function computeResponseTimings(perQuestion: Record<string, number>): ResponseTimings | undefined {
  const entries = Object.entries(perQuestion).filter(([, ms]) => typeof ms === "number" && ms > 0);
  if (entries.length === 0) return undefined;

  const values = entries.map(([, ms]) => ms);
  const totalMs = values.reduce((s, v) => s + v, 0);
  const meanMs = totalMs / values.length;

  // 中央値
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianMs = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // 中央値の2倍以上時間がかかった質問
  const threshold = medianMs * 2;
  const longConsideredQuestions = entries
    .filter(([, ms]) => ms >= threshold)
    .map(([qid]) => qid);

  // 速度プロファイル(中央値ベース)
  // 即断: 中央値 < 3秒、慎重: 中央値 > 12秒、通常: それ以外
  let speedProfile: "即断型" | "通常" | "慎重型" = "通常";
  if (medianMs < 3000) speedProfile = "即断型";
  else if (medianMs > 12000) speedProfile = "慎重型";

  return {
    perQuestion,
    totalMs: Math.round(totalMs),
    meanMs: Math.round(meanMs),
    medianMs: Math.round(medianMs),
    longConsideredQuestions,
    speedProfile,
  };
}

export function computeFullDiagnosis(
  answers: DiagnosticAnswers,
  emotions: EmotionScores,
  timingPerQuestion?: Record<string, number>,
): DiagnosticResult {
  const scores = computeAxisScores(answers);
  const aSeparation = computeASeparation(answers);
  const integration = computeIntegration(answers, scores);
  const responsibility = computeResponsibility(answers);
  const orgRisk = computeOrgRisk(answers);
  const primaryType = judgeType(scores, aSeparation, integration, orgRisk);

  // 第2層変数(2026-05-12 追加)
  const responseStyle = computeResponseStyle(answers);
  const neutralFrequency = computeNeutralFrequency(answers);
  const correlationCorrection = computeAxisCorrelationCorrection(scores);
  const timings = timingPerQuestion ? computeResponseTimings(timingPerQuestion) : undefined;

  // v2.0 新規(2026-06-13)
  const bcInsight = computeBcInsight(answers);
  const alliances = computeAlliances(answers);
  const platform = computePlatform(answers);
  const overObserver = computeOverObserver(answers);

  return {
    scores,
    emotions,
    aSeparation,
    integration,
    responsibility,
    orgRisk,
    primaryType,
    responseStyle,
    neutralFrequency,
    correlationCorrection,
    timings,
    bcInsight,
    alliances,
    platform,
    overObserver,
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

// ============================================================
// 旧 Q1-Q9 互換性のための関数(段階的廃止)
// ============================================================
export function legacyComputeAxisScores(): AxisScores {
  return { A: 0, B: 0, C: 0, D: 0 };
}

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
  // 12タイプ対応のパターン例
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
