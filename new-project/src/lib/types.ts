export type AxisKey = "A" | "B" | "C" | "D";
export type EmotionKey = "fear" | "sadness" | "anger" | "joy" | "happiness";

export const EMOTION_LABEL_JA: Record<EmotionKey, string> = {
  fear: "不安",
  sadness: "悲しみ",
  anger: "怒り",
  joy: "喜び",
  happiness: "幸福",
};

// ============================================================
// 4軸ラベル(v2.0 ハイブリッド命名・2026-06-13 内山さん承認)
// 命名方針:
//   - 軸名(2文字漢字): レーダーチャート等の表示で印象的に
//   - 意味: 自分か周りか・感情か思考かの構造を明示
//   - サブ動詞: 「これ自分の動きだ」と自分事化できる動詞表現
// ============================================================
export const AXIS_LABEL_JA: Record<AxisKey, string> = {
  A: "情熱",
  B: "関係",
  C: "洞察",
  D: "論理",
};

export const AXIS_LABEL_MEANING: Record<AxisKey, string> = {
  A: "自分の感情",
  B: "周りへの感情",
  C: "経験での判断",
  D: "言葉での判断",
};

export const AXIS_LABEL_VERB: Record<AxisKey, string> = {
  A: "感じる力",
  B: "つながる力",
  C: "見抜く力",
  D: "整理する力",
};

export const AXIS_DESCRIPTION: Record<AxisKey, string> = {
  A: "自分の中から湧く気持ちが、行動の起点になる",
  B: "場や周りの人の反応に合わせて、動きを調整する",
  C: "過去の経験の蓄積から、瞬時に判断する",
  D: "目的と根拠を整理してから、動く",
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
// v2.0(2026-06-13): 強みのペア・組み合わせクセ
// 2つの軸が結びついて他を抑圧する「同盟」を検出
// ============================================================
export type AllianceKind = "AL_BD" | "AL_AC" | "AL_BC" | "AL_AB";

export interface AllianceFlag {
  /** ペア識別子 */
  kind: AllianceKind;
  /** 一般向けラベル */
  label: string;
  /** 強度(1.0〜5.0、2問の平均) */
  strength: number;
  /** "weak" / "medium" / "strong" 3段階 */
  level: "weak" | "medium" | "strong";
}

export interface AllianceDiagnosis {
  flags: AllianceFlag[];
  /** strength >= 4.0 のペアがあれば true */
  hasStrongPair: boolean;
}

// ============================================================
// v2.0: コンディション(身体・睡眠 = Platform層)
// ============================================================
export interface PlatformDiagnosis {
  /** 睡眠・身体の総合スコア(0-10) */
  score: number;
  /** "good" / "warn" / "low" */
  status: "good" | "warn" | "low";
  /** 補足説明(1-2行) */
  note: string;
}

// ============================================================
// v2.0: 人を読む力(B由来C・対人カン)
// ============================================================
export interface BcInsightScore {
  /** 対人カンの素点 0-25 */
  score: number;
  /** 「人は必ず裏切る」系の歪曲指標(BC-5、1-5) */
  distortion: number;
  /** "healthy" / "distorted" / "low" */
  status: "healthy" | "distorted" | "low";
}

// ============================================================
// v2.0: 考えすぎ状態(過剰Observer)
// ============================================================
export interface OverObserverDiagnosis {
  /** OD平均(1-5) */
  level: number;
  /** flag: 過剰Observerの兆候 */
  flag: boolean;
  note: string;
}

// ============================================================
// 第2層変数:Response Style Profile
// 122人実証分析 (2026-05-12) から導入。Likert加点方式のバイアスを補正する
// ============================================================
export type ResponseStyle =
  | "Modest"        // 穏当型: 2-4に集中(60%以上)
  | "Discriminant"  // 識別型: 1-5を幅広く使う(極端度0.15-0.45)
  | "Extreme"       // 極端型: 1か5ばかり(50%以上)
  | "Neutral"       // 中立型: 3ばかり(40%以上)
  | "Acquiescence"  // 同意型: 全体平均4.0以上
  | "Disacquiescence"; // 否定型: 全体平均2.0以下

export interface ResponseStyleProfile {
  style: ResponseStyle;
  /** 1-5それぞれを選んだ回数 */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  /** 全回答の平均値 */
  mean: number;
  /** 全回答の標準偏差 */
  sd: number;
  /** 1または5を選んだ率 */
  extremeRatio: number;
  /** 3(中立)を選んだ率 */
  neutralRatio: number;
  /** 2か4を選んだ率 */
  midRatio: number;
  /** 加点バイアスの方向と強さ。0=中央、正=同意、負=否定 */
  acquiescenceBias: number;
  /** 注意フラグ(例: "中立すぎて識別不能", "極端で読み取り注意") */
  warnings: string[];
}

// ============================================================
// 第2層変数:Neutral Frequency
// 中立(3)を選ぶ頻度。v3.0仕様書の概念をLikertに適用
// 30%超で解離・無感覚フラグの判定材料
// ============================================================
export interface NeutralFrequencyV1 {
  count: number; // 3を選んだ回数
  total: number; // 全質問数
  ratio: number; // count / total
  highFlag: boolean; // ratio > 0.30
}

// ============================================================
// 第2層変数:軸間相関補正
// 122人データから C-D が 0.37、A-D が -0.20 と判明。
// 軸を完全に独立とみなさず、純粋成分を推定する
// ============================================================
export interface AxisCorrelationCorrection {
  /** C軸から「D軸と共通する成分」を引いた純粋C */
  pureC: number;
  /** D軸から「C軸と共通する成分」を引いた純粋D */
  pureD: number;
  /** A軸を補正(A-D負相関 -0.20 を考慮) */
  adjustedA: number;
  /** B軸を補正(B-C負相関 -0.18 を考慮) */
  adjustedB: number;
  /** どの軸ペアが連動していたかの説明 */
  notes: string[];
}

// ============================================================
// 第2層変数:回答時間プロファイル
// 各質問にかかった時間 (ms) を記録し、慎重型/即断型/長考点を可視化
// ============================================================
export interface ResponseTimings {
  /** 質問IDごとの回答時間(ms) */
  perQuestion: Record<string, number>;
  /** 全質問の合計時間(ms) */
  totalMs: number;
  /** 1問あたり平均(ms) */
  meanMs: number;
  /** 中央値(ms) */
  medianMs: number;
  /** 中央値の2倍以上時間がかかった質問ID(長考点) */
  longConsideredQuestions: string[];
  /** 慎重型/即断型/通常 */
  speedProfile: "即断型" | "通常" | "慎重型";
}

// ============================================================
// AI生成テキストレポートのキャッシュ
// 自己分析レポート / マネジメントガイド / 1年後比較レポートなど、
// 一度生成したらキャッシュして再生成しない
// ============================================================
export interface CachedReport {
  text: string;
  generatedAt: string; // ISO timestamp
  modelVersion?: string;
}

// ============================================================
// AI個別分析:診断結果 × 経歴 × 第2層変数 から生成された個別の分析文
// TYPE_DESCRIPTIONS(静的テンプレ)と同じ shape だが、内容は個別化される
// ============================================================
export interface PersonalInsight {
  generatedAt: string; // ISO timestamp
  modelVersion?: string;
  headline: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  bestFitRoles: string[];
  managementHint: string;
  growthDirection: string;
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
  // ─ 第2層変数(2026-05-12 追加) ─
  /** Likert加点方式のバイアスを補正するための回答スタイル分析 */
  responseStyle?: ResponseStyleProfile;
  /** 中立(3)選択頻度。解離・無感覚フラグの判定材料 */
  neutralFrequency?: NeutralFrequencyV1;
  /** 軸間相関を考慮した純粋成分(122人実証から導出) */
  correlationCorrection?: AxisCorrelationCorrection;
  /** 各質問への回答時間プロファイル(任意) */
  timings?: ResponseTimings;
  // ─ v2.0 新規(2026-06-13) ─
  /** 人を読む力(対人カン) */
  bcInsight?: BcInsightScore;
  /** 強みのペア・組み合わせクセ */
  alliances?: AllianceDiagnosis;
  /** コンディション(身体・睡眠) */
  platform?: PlatformDiagnosis;
  /** 考えすぎ状態(過剰Observer) */
  overObserver?: OverObserverDiagnosis;
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
// スタンドアロン診断(/diagnose 経由・応募者/社員に紐づかない)
// セルフ診断、社員の再診断、外部組込みの結果保存先として使う
// ============================================================
export interface StandaloneDiagnosis {
  id: string;
  date: string; // YYYY-MM-DD
  profile: {
    fullName: string;
    ageRange: string;
    gender: "男性" | "女性" | "その他";
    /** 任意の文脈情報(職種・業種・属性などAI個別分析の参考) */
    optionalContext?: string;
    email?: string;
  };
  scores: AxisScores;
  emotions: EmotionScores;
  type: QuadType;
  result?: DiagnosticResult;
  /** AI個別分析結果(初回生成後キャッシュ) */
  personalInsight?: PersonalInsight;
  /** AI生成テキストレポートのキャッシュ */
  reports?: {
    self?: CachedReport;
    manager?: CachedReport;
  };
  /** 別の StandaloneDiagnosis ID(時系列比較用、なければ単発) */
  previousId?: string;
  /** 任意のメモ */
  notes?: string;
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

// ============================================================
// 会社プロファイル(AI個別分析の適性判定で使用)
// ============================================================
export interface CompanyProfile {
  /** 会社名 */
  companyName?: string;
  /** 理念・ミッション(自由記述) */
  philosophy?: string;
  /** 求める人物像(自由記述) */
  idealCandidate?: string;
  /**
   * 4軸の理想バランス(各 0-5)
   * 例: 営業会社 → A=5, B=3, C=4, D=2(感情・直感重視、規範低め)
   */
  axisBalance?: Partial<AxisScores>;
  /** 重視する性質(チェックボックス的) */
  emphasizedQualities?: string[];
  /** 業種・規模など追加コンテキスト */
  context?: string;
}

export interface Settings {
  inputMode: "questions" | "resume" | "both";
  stageLabels: Record<StageId, string>;
  stageOrder: StageId[];
  /** 会社プロファイル(任意・AI個別分析で参照) */
  company?: CompanyProfile;
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
  /**
   * 質問セットのバージョン。将来質問群が変わっても、過去診断のスコアと整合性を保てる。
   * デフォルト: "v1.0" (Likert 75問体系)
   */
  questionSetVersion?: string;
  // 新75問体系の回答(オプション: seed データには無くてもよい)
  answers?: DiagnosticAnswers;
  scores: AxisScores;
  emotions: EmotionScores;
  type: QuadType;
  // 拡張診断データ(新フォーム経由ならフル、seedはオプション)
  result?: DiagnosticResult;
  /** AI 個別分析(診断結果×経歴×第2層変数 を Claude に渡して生成。一度生成したらキャッシュ) */
  personalInsight?: PersonalInsight;
  /** AI生成テキストレポートのキャッシュ */
  reports?: {
    self?: CachedReport;     // 自己分析レポート
    manager?: CachedReport;  // マネジメントガイド
  };
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
  /** 1年後比較レポートのキャッシュ(AI生成、再生成しない限り維持) */
  compareReport?: CachedReport;
}

// ============================================================
// 質問体系
// ============================================================
export type QuestionCategory =
  // v1.0 互換
  | "axis_A" | "axis_B" | "axis_C" | "axis_D"
  | "iA" | "eA" | "FZ"
  | "OB" | "SW"
  | "DR" | "BR" | "AR"
  | "AG" | "RV" | "IM"
  // v2.0 新規(2026-06-13)
  | "axis_BC"     // 人を読む力(B由来C・対人カン)
  | "AS"          // A抑圧判定(内側で感じてるのに出さない)
  | "OD"          // 過剰Observer(考えすぎ状態)
  | "AL_BD"       // 強みのペア:情熱×論理(「正しさの檻」)
  | "AL_AC"       // 強みのペア:情熱×洞察(「天才の暴走」)
  | "AL_BC"       // 強みのペア:関係×洞察(「空気の独裁」)
  | "AL_AB"       // 強みのペア:情熱×関係(「承認の炎」)
  | "PL";         // コンディション(身体・睡眠)

export interface DiagnosticQuestion {
  id: string;
  text: string;
  category: QuestionCategory;
  kind: "core" | "support" | "reverse"; // 種別
  weight: number; // 1.0 or 1.5 or 2.0(★核心)
}
