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

// ============================================================
// G6: 12タイプ完全マッピング(診断仕様書 v1.0)
// ============================================================
export type QuadType =
  | "統合型"
  | "突破型"
  | "共感型"
  | "設計型"
  | "忠実型"
  | "直感型"
  | "分析型"
  | "蓄積型"
  | "A抑圧型"
  | "A凍結型"
  | "中庸偽装型"
  | "単独運転型";

export const ALL_QUAD_TYPES: QuadType[] = [
  "統合型",
  "突破型",
  "共感型",
  "設計型",
  "忠実型",
  "直感型",
  "分析型",
  "蓄積型",
  "A抑圧型",
  "A凍結型",
  "中庸偽装型",
  "単独運転型",
];

// ============================================================
// G2: A発火/A表出分離
// ============================================================
export type AClassification =
  | "真性A低"
  | "A抑圧型"
  | "A凍結型"
  | "A管理型"
  | "演技的表出フラグ";

export interface ASeparation {
  internal: number; // 内的A(0-25)
  external: number; // 表出A(0-25)
  classification: AClassification;
  frozen: boolean; // FZ-1 / FZ-2 が高い
}

// ============================================================
// G4: 統合状態の直接検出
// ============================================================
export type IntegrationStatus =
  | "本物の統合"
  | "部分統合"
  | "偽の中庸"
  | "単独運転";

export interface IntegrationDiagnosis {
  observerScore: number; // 0-30
  switchScore: number; // 0-30
  index: number; // (observer + switch) / 2
  status: IntegrationStatus;
}

// ============================================================
// G3: 責任感の3形態
// ============================================================
export type ResponsibilityKind = "D型" | "B型" | "A型";

export interface ResponsibilityDiagnosis {
  scores: Record<ResponsibilityKind, number>; // 4-20点
  primary: ResponsibilityKind;
  secondary?: ResponsibilityKind; // 複合型の場合
  isCompound: boolean;
}

// ============================================================
// G5: 組織毀損プロファイル(内部出力のみ)
// ============================================================
export type OrgRiskCategory = "承認略奪型" | "ルール暴力型" | "衝動暴走型";

export interface OrgRiskFlag {
  category: OrgRiskCategory;
  score: number; // 3-15点
  level: "low" | "medium" | "high";
}

export interface OrgRiskDiagnosis {
  flags: OrgRiskFlag[]; // 閾値超過したものだけ
  hasAnyRisk: boolean;
}

// ============================================================
// 統合診断結果(全部入り)
// ============================================================
export interface DiagnosticResult {
  scores: AxisScores;
  emotions: EmotionScores;
  aSeparation: ASeparation;
  integration: IntegrationDiagnosis;
  responsibility: ResponsibilityDiagnosis;
  orgRisk: OrgRiskDiagnosis; // 内部出力のみで使う
  primaryType: QuadType;
}

// ============================================================
// 診断回答(75問体系)
// ============================================================
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface DiagnosticAnswers {
  // 軸スコア用(A-1〜A-8, B-1〜B-8, C-1〜C-8, D-1〜D-8)
  axis: Record<string, LikertValue>;
  // G2: A発火/表出(iA-1〜iA-5, eA-1〜eA-5, FZ-1, FZ-2)
  aSeparation: Record<string, LikertValue>;
  // G4: 統合状態(OB-1〜OB-5, SW-1〜SW-5)
  integration: Record<string, LikertValue>;
  // G3: 責任感(DR-1〜DR-4, BR-1〜BR-4, AR-1〜AR-4)
  responsibility: Record<string, LikertValue>;
  // G5: 組織毀損(AG-1〜AG-3, RV-1〜RV-3, IM-1〜IM-3)
  orgRisk: Record<string, LikertValue>;
}

// ============================================================
// 履歴書解析結果
// ============================================================
export interface ResumeData {
  fullName?: string;
  age?: string;
  gender?: string;
  address?: string;
  email?: string;
  phone?: string;
  education?: { school: string; period: string; degree?: string }[];
  workHistory?: { company: string; period: string; role: string; description?: string }[];
  skills?: string[];
  selfPR?: string;
  fileName?: string;
}

// ============================================================
// 採用ファネル段階
// ============================================================
export type StageId =
  | "applied"
  | "selection_1"
  | "selection_2"
  | "selection_final"
  | "hired"
  | "rejected";

export interface Settings {
  inputMode: "questions" | "resume" | "both";
  stageLabels: Record<StageId, string>;
  stageOrder: StageId[];
}

// ============================================================
// 面接シート
// ============================================================
export interface InterviewRound {
  stageId: StageId;
  date: string;
  interviewer: string;
  suggestedQuestions: string[];
  notes: string;
  outcome: "pending" | "pass" | "fail" | "hold";
}

// ============================================================
// 診断結果(1回分)
// ============================================================
export interface Diagnosis {
  date: string;
  scenario: "応募時" | "採用時" | "1年後" | "再診断";
  // 新75問体系の回答(オプション: seed データには無くてもよい)
  answers?: DiagnosticAnswers;
  scores: AxisScores;
  emotions: EmotionScores;
  type: QuadType;
  // 拡張診断データ(新フォーム経由ならフル、seedはオプション)
  result?: DiagnosticResult;
}

// ============================================================
// 応募者
// ============================================================
export interface Applicant {
  id: string;
  profile: {
    fullName: string;
    ageRange: string;
    gender: "男性" | "女性" | "その他";
    email?: string;
    phone?: string;
    appliedPosition: string;
    appliedDate: string;
  };
  resume?: ResumeData;
  careerAnswers?: {
    education: string;
    workHistory: string;
    selfPR: string;
  };
  diagnoses: Diagnosis[];
  currentStage: StageId;
  interviews: InterviewRound[];
  presetTendency?: "A優位" | "D優位" | "B優位" | "統合";
  generalNotes?: string;
}

// ============================================================
// 1on1
// ============================================================
export interface OneOnOne {
  id: string;
  employeeId: string;
  date: string;
  manager: string;
  topics: string[];
  notes: string;
  nextActions?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

// ============================================================
// 社員
// ============================================================
export interface Employee {
  id: string;
  fullName: string;
  ageRange: string;
  gender: "男性" | "女性" | "その他";
  hireDate: string;
  currentRole: string;
  team: string;
  manager: string;
  fromApplicantId?: string;
  diagnoses: Diagnosis[];
  resume?: ResumeData;
  presetTendency?: "A優位" | "D優位" | "B優位" | "統合";
  status: "在籍" | "休職" | "退職";
  performance?: "S" | "A" | "B" | "C";
  potential?: "高" | "中" | "低";
}

// ============================================================
// 質問体系
// ============================================================
export type QuestionCategory =
  | "axis_A" | "axis_B" | "axis_C" | "axis_D"
  | "iA" | "eA" | "FZ"
  | "OB" | "SW"
  | "DR" | "BR" | "AR"
  | "AG" | "RV" | "IM";

export interface DiagnosticQuestion {
  id: string;
  text: string;
  category: QuestionCategory;
  kind: "core" | "support" | "reverse"; // 種別
  weight: number; // 1.0 or 1.5
}
