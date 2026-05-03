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

// ============================================================
// 採用ファネルの段階
// ============================================================
// stageId はSettingsで可変。デフォルトは下記。
// "applied" は固定(応募直後)、"hired" / "rejected" も固定終端。
// 中間の selection_* はSettings.selectionStagesで命名・追加可能。
export type StageId =
  | "applied" // 応募
  | "selection_1" // 選考1次(企業によって名前可変)
  | "selection_2" // 選考2次
  | "selection_final" // 最終
  | "hired" // 合格(=採用)
  | "rejected"; // 不採用

export interface Settings {
  // 候補者の経歴情報入力モード
  inputMode: "questions" | "resume" | "both";
  // 選考段階の表示ラベル(StageIdとの対応)
  stageLabels: Record<StageId, string>;
  // 表示順
  stageOrder: StageId[];
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
  // 元アップロードファイル名
  fileName?: string;
}

// ============================================================
// 面接シート
// ============================================================
export interface InterviewRound {
  stageId: StageId; // どの選考フェーズの面接か
  date: string;
  interviewer: string;
  // システムが提案した質問
  suggestedQuestions: string[];
  // 面接官のメモ
  notes: string;
  // この回の判定
  outcome: "pending" | "pass" | "fail" | "hold";
}

// ============================================================
// 診断結果(1回分)
// ============================================================
export interface Diagnosis {
  date: string;
  scenario: "応募時" | "採用時" | "1年後" | "再診断";
  answers: AxisKey[];
  scores: AxisScores;
  emotions: EmotionScores;
  type: QuadType;
}

// ============================================================
// 応募者(採用ファネル中の人)
// ============================================================
export interface Applicant {
  id: string;
  // プロフィール(質問形式 or 履歴書解析の結果が入る)
  profile: {
    fullName: string;
    ageRange: string;
    gender: "男性" | "女性" | "その他";
    email?: string;
    phone?: string;
    appliedPosition: string;
    appliedDate: string;
  };
  // 経歴(質問形式 or 履歴書解析)
  resume?: ResumeData;
  // 質問形式で答えた経歴(モードAの場合)
  careerAnswers?: {
    education: string;
    workHistory: string;
    selfPR: string;
  };
  // 診断結果(応募時+必要に応じて再診断)
  diagnoses: Diagnosis[];
  // 現在の段階
  currentStage: StageId;
  // 選考フェーズの履歴
  interviews: InterviewRound[];
  // タイプ判定キャッシュ(最新)
  presetTendency?: "A優位" | "D優位" | "B優位" | "統合";
  // メモ
  generalNotes?: string;
}

// ============================================================
// 1on1 ミーティング記録
// ============================================================
export interface OneOnOne {
  id: string;
  employeeId: string;
  date: string;
  manager: string;
  topics: string[];
  notes: string;
  nextActions?: string;
  mood?: 1 | 2 | 3 | 4 | 5; // 本人の状態(本人申告 or 上司観察)
}

// ============================================================
// 社員(採用後 = マネジメント対象)
// ============================================================
export interface Employee {
  id: string;
  fullName: string;
  ageRange: string;
  gender: "男性" | "女性" | "その他";
  hireDate: string;
  currentRole: string;
  team: string; // 例: "営業部" / "プロダクト開発" / "顧客対応"
  manager: string;
  // 採用時の応募者ID(リンク)
  fromApplicantId?: string;
  // 診断履歴(採用時 / 半年 / 1年 / 2年など)
  diagnoses: Diagnosis[];
  // 応募者から引き継いだプロフィール
  resume?: ResumeData;
  presetTendency?: "A優位" | "D優位" | "B優位" | "統合";
  // 直近の状態
  status: "在籍" | "休職" | "退職";
  // 直近の評価
  performance?: "S" | "A" | "B" | "C";
  // 成長余地(リーダーシップ/専門性等の総合評価)
  potential?: "高" | "中" | "低";
}

export interface Question {
  id: string;
  text: string;
  options: { axis: AxisKey; label: string }[];
}
