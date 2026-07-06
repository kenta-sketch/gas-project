// QMT 30問診断 v3.0(2026-07-06)
// 理論底本: docs/theory/pdfs/2026-06-13-QMT-theory-v10-complete.pdf
// 旧版: questions-v1.ts(75問体系) / questions-v2.ts(49問体系)
//
// v3.0 の設計方針(実ユーザーテストのフィードバック反映):
// 「質問の意図が複雑で何を聞かれているか分からない → 回答が雑になる」
//   1. 1問 = 1文 = 1概念。複合文・カッコ書きの補足・メタ認知要求を排除
//   2. 日常語だけで書く(MBTI/16タイプ診断レベルの平易さ)
//   3. 15〜30字程度の短文
//   4. 49問 → 30問(体感5〜7分)
//
// 30問構成:
//   axis(19): A 5(内3+表出2) + B 3(内側) + C 4 + D 4 + BC 3(人を読む2+歪み1)
//   aSeparation(5): AS 1(抑圧) + eB 2(B表出) + FZ 2(凍結)
//   integration(4): OB 3(事後/途中/事前) + OD 1(考えすぎ)
//   orgRisk(2): PL 2(コンディション)
//
// エンジン同盟(旧AL 8問)は質問を廃止し、軸スコアからの推定に変更(scoring.ts)。
// ※ 過去バージョンとのスコア比較は同一バージョン同士のみ有効。

import type { DiagnosticQuestion, EmotionKey } from "./types";

// ============================================================
// axis: 4つの動き方 + 人を読む力(19問)
// ============================================================
export const AXIS_QUESTIONS: DiagnosticQuestion[] = [
  // ─────── 情熱(自分の感情)5問 ───────
  // 内側(A-1〜A-3)
  { id: "A-1", text: "うれしい・悔しいといった気持ちが、人より強く湧くほうだ", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-2", text: "理由はうまく言えなくても、好き嫌いははっきりしている", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-3", text: "一人で音楽や映画に触れて、涙が出たり鳥肌が立ったりすることがある", category: "axis_A", kind: "core", weight: 1.5 },
  // 表出(A-4, A-5)
  { id: "A-4", text: "うれしいときは、その場で顔や言葉に出る", category: "axis_A", kind: "support", weight: 1.5 },
  { id: "A-5", text: "嫌なことは「嫌だ」と相手に言えるほうだ", category: "axis_A", kind: "support", weight: 1.5 },

  // ─────── 関係(周りへの感情)3問 ── 内側の反応 ───────
  { id: "B-1", text: "人にどう思われたか、あとまで気になるほうだ", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-2", text: "期待されると、プレッシャーを強く感じる", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-3", text: "人に言われた一言を、何日も引きずることがある", category: "axis_B", kind: "core", weight: 1.5 },

  // ─────── 洞察(経験での判断)4問 ───────
  { id: "C-1", text: "仕事で「これはうまくいく」「これは危ない」が、理由より先にわかることがある", category: "axis_C", kind: "core", weight: 2.0 },
  { id: "C-2", text: "昔の経験のおかげで、とっさの判断ができることが多い", category: "axis_C", kind: "core", weight: 1.5 },
  { id: "C-3", text: "決まったやり方がない場面でも、その場でなんとか対応できる", category: "axis_C", kind: "support", weight: 1.5 },
  { id: "C-4", text: "「なんとなく」で決めることは、ほとんどない", category: "axis_C", kind: "reverse", weight: 1.0 },

  // ─────── 論理(言葉での判断)4問 ───────
  { id: "D-1", text: "動く前に、順番や段取りを考えたいほうだ", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-2", text: "自分の考えを、順序立てて説明するのが得意だ", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-3", text: "決めたルールや手順は、きちんと守りたい", category: "axis_D", kind: "support", weight: 1.5 },
  { id: "D-4", text: "計画を立てるより、とりあえずやってみるほうだ", category: "axis_D", kind: "reverse", weight: 1.0 },

  // ─────── 人を読む力(対人カン)3問 ───────
  { id: "BC-1", text: "相手が「大丈夫」と言っていても、無理をしているかどうかわかる", category: "axis_BC", kind: "core", weight: 2.0 },
  { id: "BC-2", text: "場の空気が悪くなりそうなとき、早めに気づくほうだ", category: "axis_BC", kind: "core", weight: 1.5 },
  { id: "BC-5", text: "正直、人は最後には裏切るものだと思うことがある", category: "axis_BC", kind: "reverse", weight: 1.0 },
];

// ============================================================
// aSeparation: 内側と外側のギャップ(5問)
// ============================================================
export const A_SEPARATION_QUESTIONS: DiagnosticQuestion[] = [
  // A抑圧(火山型)のサイン
  { id: "AS-1", text: "あとから「本当はこう言いたかった」と思うことが多い", category: "AS", kind: "core", weight: 2.0 },
];

// B表出 ──「気にしているのに出さない=隠れ消耗型」の検出
export const B_EXPRESSION_QUESTIONS: DiagnosticQuestion[] = [
  { id: "eB-1", text: "不安や悩みを、人に話せるほうだ", category: "eB", kind: "core", weight: 1.5 },
  { id: "eB-2", text: "平気なフリをするのが得意だ", category: "eB", kind: "reverse", weight: 1.5 },
];

// 凍結判別
export const FZ_QUESTIONS: DiagnosticQuestion[] = [
  { id: "FZ-1", text: "「何も感じない」「何がしたいのかわからない」ときがある", category: "FZ", kind: "core", weight: 2.0 },
  { id: "FZ-2", text: "黙っているときも、頭や心の中ではいろいろ動いている", category: "FZ", kind: "core", weight: 2.0 },
];

// ============================================================
// integration: 気づきの力(4問)
// ============================================================
export const INTEGRATION_QUESTIONS: DiagnosticQuestion[] = [
  // 気づきの3段階(事後 → 途中 → 事前)
  { id: "OB-1", text: "あとになって「さっきは感情的だったな」と気づくことがある", category: "OB", kind: "core", weight: 1.5 },
  { id: "OB-2", text: "カッとなっている最中に「いま感情的になってるな」と気づけることがある", category: "OB", kind: "core", weight: 1.5 },
  { id: "OB-3", text: "カッとなりそうなとき、口に出す前にひと呼吸おける", category: "OB", kind: "core", weight: 2.0 },
  // 考えすぎ(過剰Observer)
  { id: "OD-1", text: "考えすぎて動けなくなることがある", category: "OD", kind: "core", weight: 1.5 },
];

// ============================================================
// 旧: 強みのペア質問(v2の8問)── v3.0で廃止。
// 同盟の検出は軸スコアからの推定に移行(scoring.ts computeAlliances)。
// 後方互換のため空配列をエクスポート。
// ============================================================
export const RESPONSIBILITY_QUESTIONS: DiagnosticQuestion[] = [];

// ============================================================
// orgRisk: コンディション(2問)
// ============================================================
export const ORG_RISK_QUESTIONS: DiagnosticQuestion[] = [
  { id: "PL-1", text: "ここ1ヶ月、よく眠れている", category: "PL", kind: "core", weight: 2.0 },
  { id: "PL-2", text: "疲れや空腹など、体のサインに気づくほうだ", category: "PL", kind: "core", weight: 1.5 },
];

// ============================================================
// セクション定義(/diagnose で段階表示)
// ============================================================
export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  questions: DiagnosticQuestion[];
  field: "axis" | "aSeparation" | "integration" | "responsibility" | "orgRisk";
}

export const QUESTION_SECTIONS: QuestionSection[] = [
  {
    id: "axis",
    title: "Section 1: ふだんの動き方(19問)",
    description:
      "深く考えず、直感でサクサク答えてください。「ふだんの自分」に近いかどうかで選べばOKです。",
    questions: AXIS_QUESTIONS,
    field: "axis",
  },
  {
    id: "aSeparation",
    title: "Section 2: 内側と外側(5問)",
    description:
      "「心の中で感じていること」と「外に出していること」のギャップについての質問です。",
    questions: [...A_SEPARATION_QUESTIONS, ...B_EXPRESSION_QUESTIONS, ...FZ_QUESTIONS],
    field: "aSeparation",
  },
  {
    id: "integration",
    title: "Section 3: 気づく力(4問)",
    description:
      "感情が動いたとき、自分でどこまで気づけるかについての質問です。",
    questions: INTEGRATION_QUESTIONS,
    field: "integration",
  },
  {
    id: "orgRisk",
    title: "Section 4: 最近の調子(2問)",
    description: "最後に、ここ最近のコンディションを教えてください。",
    questions: ORG_RISK_QUESTIONS,
    field: "orgRisk",
  },
];

// ============================================================
// 5感情(現在の状態)
// ============================================================
export const EMOTION_QUESTIONS: { key: EmotionKey; text: string }[] = [
  { key: "fear", text: "現在、どの程度「不安」を感じていますか?" },
  { key: "sadness", text: "現在、どの程度「悲しみ」を感じていますか?" },
  { key: "anger", text: "現在、どの程度「怒り」を感じていますか?" },
  { key: "joy", text: "現在、どの程度「喜び」を感じていますか?" },
  { key: "happiness", text: "現在、どの程度「幸福」を感じていますか?" },
];

// v1.0 互換性のため残す
export const QUESTIONS = AXIS_QUESTIONS;
