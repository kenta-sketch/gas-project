// QMT 50問診断 v2.0(2026-06-13)
// 設計書: docs/theory/notes/2026-06-13-qmt-50q-design-v2.md
// 理論底本: docs/theory/pdfs/2026-06-13-QMT-theory-v10-complete.pdf
//
// 47問構成:
//   axis(26): A 5 + B 6 + C 5 + D 5 + BC 5 = 26問(コア4軸 + 人を読む力)
//   aSeparation(4): AS-1, AS-2(A抑圧判定) + FZ-1, FZ-2(凍結判別)
//   integration(7): OB-1〜OB-5(気づきの段階) + OD-1, OD-2(考えすぎ)
//   responsibility(8): 強みのペア(BD, AC, BC, AB 各2問)
//   orgRisk(2): PL-1, PL-2(コンディション)
//
// 言葉遣い方針: 学術用語(動物的感情/機械的理性 等)排除。一般会社員にも伝わる平易な日本語。

import type { DiagnosticQuestion, EmotionKey } from "./types";

// ============================================================
// axis: 4軸 + 人を読む力(26問)
// ============================================================
export const AXIS_QUESTIONS: DiagnosticQuestion[] = [
  // ─────── 情熱(自分の感情)5問 ───────
  { id: "A-1", text: "嫌なことがあったとき、理由を考える前にまず身体が反応する(胸が締まる、動悸、熱くなる など)", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-2", text: "危険や違和感を、理屈より先に感覚として察知できる", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-3", text: "誰もいない場所で、好きなものに触れたとき、内側が強く動く", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-4", text: "嬉しいとき、その場で素直に「嬉しい」と表現できる", category: "axis_A", kind: "support", weight: 1.5 },
  { id: "A-5", text: "嫌だと感じたことを、相手にそのまま「嫌だ」と伝えられる", category: "axis_A", kind: "support", weight: 1.5 },

  // ─────── 関係(周りへの感情)6問 ───────
  { id: "B-1", text: "他人にどう思われているかが、頭から離れない時間がある", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-2", text: "「期待されている」と感じると、それに応えなければというプレッシャーが強くなる", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-3", text: "拒絶・否定されると、その後しばらく内側で引っかかり続ける", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-4", text: "嫌われたくなくて、断れないことがある", category: "axis_B", kind: "support", weight: 1.5 },
  { id: "B-5", text: "場の空気を壊さないように、自分の発言や行動を調整する", category: "axis_B", kind: "support", weight: 1.5 },
  { id: "B-6", text: "周囲の反応によって、意思決定が変わることがある", category: "axis_B", kind: "support", weight: 1.5 },

  // ─────── 洞察(経験での判断)5問 ───────
  { id: "C-1", text: "自分の主な仕事領域で、言語化できないが「これは行ける/危ない」と分かる瞬間がある", category: "axis_C", kind: "core", weight: 2.0 },
  { id: "C-2", text: "5年前なら気づかなかった微細なシグナル(相手の表情・場の流れ等)に、今は気づける", category: "axis_C", kind: "core", weight: 1.5 },
  { id: "C-3", text: "「なぜそう判断したか」を後から言葉にしようとすると、上手く説明できない", category: "axis_C", kind: "core", weight: 1.0 },
  { id: "C-4", text: "過去の似た失敗経験が、瞬間的に判断を助けることがある", category: "axis_C", kind: "support", weight: 1.5 },
  { id: "C-5", text: "専門外の領域では、自分の直感が当てにならないと自覚している", category: "axis_C", kind: "support", weight: 1.5 },

  // ─────── 論理(言葉での判断)5問 ───────
  { id: "D-1", text: "判断する前に、目的と基準を言語化したくなる", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-2", text: "自分の判断理由を、他者に分かるように説明できる", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-3", text: "成功パターンを言葉で残すことを習慣にしている", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-4", text: "感情が動いた直後でも、論理的に整理してから動ける", category: "axis_D", kind: "support", weight: 1.5 },
  { id: "D-5", text: "「考えすぎて動けない」状態に陥ることがある", category: "axis_D", kind: "support", weight: 1.0 },

  // ─────── 人を読む力(対人カン・B由来C)5問 ───────
  { id: "BC-1", text: "相手が「大丈夫」と言っていても、大丈夫じゃないと察知できる", category: "axis_BC", kind: "core", weight: 2.0 },
  { id: "BC-2", text: "初対面で「この人は信頼できる/危ない」を感じ取り、後で当たることが多い", category: "axis_BC", kind: "core", weight: 1.5 },
  { id: "BC-3", text: "場が変な空気になる前に、その兆しを感じる", category: "axis_BC", kind: "core", weight: 1.5 },
  { id: "BC-4", text: "過去に拒絶や裏切りを経験し、それを今の対人判断に活かしている", category: "axis_BC", kind: "support", weight: 1.5 },
  { id: "BC-5", text: "「人は必ず裏切る」「結局みんな自分のことしか考えない」と感じることがある", category: "axis_BC", kind: "reverse", weight: 1.0 },
];

// ============================================================
// aSeparation: A抑圧判定 + 凍結判別(4問)
// 「内側で感じてるのに、外に出さない」状態の検出
// ============================================================
export const A_SEPARATION_QUESTIONS: DiagnosticQuestion[] = [
  // A抑圧判定 ── 一人だと感じる、人前だと出せない
  { id: "AS-1", text: "一人ならできるが、人前ではできない感情表現がある", category: "AS", kind: "core", weight: 2.0 },
  { id: "AS-2", text: "後から「本当はこう言いたかった」と思うことが多い", category: "AS", kind: "core", weight: 2.0 },
];

// 凍結判別(常時2問・条件分岐なし、シンプル化)
export const FZ_QUESTIONS: DiagnosticQuestion[] = [
  { id: "FZ-1", text: "「何も感じない」「何がしたいか分からない」状態があることがある", category: "FZ", kind: "core", weight: 2.0 },
  { id: "FZ-2", text: "沈黙しているとき、内側では強く感じていることが多い", category: "FZ", kind: "core", weight: 2.0 },
];

// ============================================================
// integration: 気づきの力(Observer 5問 + 考えすぎ 2問)
// ============================================================
export const INTEGRATION_QUESTIONS: DiagnosticQuestion[] = [
  // 気づきの段階(Observer Lv.1 → Lv.3)
  { id: "OB-1", text: "感情で動いた後で「あのとき感情で動いていた」と気づくことがある", category: "OB", kind: "core", weight: 1.5 }, // Lv.1事後
  { id: "OB-2", text: "感情が動いている最中に「今これに反応している」と認識できることがある", category: "OB", kind: "core", weight: 1.5 }, // Lv.2途中
  { id: "OB-3", text: "強い感情が湧きそうなとき、湧く前に予測してブレーキをかけられる", category: "OB", kind: "core", weight: 2.0 }, // Lv.3事前
  { id: "OB-4", text: "「分かっているのにできない」状態を経験することがある", category: "OB", kind: "support", weight: 1.0 },
  { id: "OB-5", text: "衝動的に動きそうなとき、一瞬止まれることがある", category: "OB", kind: "support", weight: 1.5 }, // Veto

  // 考えすぎ状態(過剰Observer)
  { id: "OD-1", text: "すべての感情・行動に対して自分を監視する癖があり、それで動きが鈍ることがある", category: "OD", kind: "core", weight: 1.5 },
  { id: "OD-2", text: "何かを決めるとき、選択肢を見すぎて決められなくなることがある", category: "OD", kind: "core", weight: 1.5 },
];

// ============================================================
// responsibility: 強みのペア・組み合わせクセ(8問)
// 二つの軸が結びついて他を抑圧する状態を検出
// ============================================================
export const RESPONSIBILITY_QUESTIONS: DiagnosticQuestion[] = [
  // 「関係 × 論理」=「正しさの檻」(期待×論理で自分を縛るクセ)
  { id: "AL-BD1", text: "「期待に応えなければ」という感覚と、「論理的に正しいから」という感覚が混ざって自分を駆動することがある", category: "AL_BD", kind: "core", weight: 1.5 },
  { id: "AL-BD2", text: "疲れていても「やるべきだから」「期待されているから」を理由に続けてしまう", category: "AL_BD", kind: "core", weight: 1.5 },

  // 「情熱 × 洞察」=「天才の暴走」(感じたこと+経験で他を軽視するクセ)
  { id: "AL-AC1", text: "自分の感じたことと過去の経験が合致すれば、他人の異論や論理は不要と感じる", category: "AL_AC", kind: "core", weight: 1.5 },
  { id: "AL-AC2", text: "計画や慎重さより、自分の感覚と経験で動く方がうまくいく", category: "AL_AC", kind: "core", weight: 1.5 },

  // 「関係 × 洞察」=「空気の独裁」(空気と経験で本音を出さないクセ)
  { id: "AL-BC1", text: "場の空気を読み、過去の経験的にこの場はこう動くと感じたら、本音を出すより合わせる", category: "AL_BC", kind: "core", weight: 1.5 },
  { id: "AL-BC2", text: "「前回うまくいったから今回も同じやり方で」と組織や自分で繰り返している", category: "AL_BC", kind: "core", weight: 1.5 },

  // 「情熱 × 関係」=「承認の炎」(感情と承認で振り回されるクセ)
  { id: "AL-AB1", text: "強く感じたことを、誰かに認められたい気持ちが同時に来ることがある", category: "AL_AB", kind: "core", weight: 1.5 },
  { id: "AL-AB2", text: "認められると無敵、拒絶されると崩壊するような両極端の気分を経験する", category: "AL_AB", kind: "core", weight: 1.5 },
];

// ============================================================
// orgRisk: コンディション(2問)
// 身体・睡眠は心理機能の土台
// ============================================================
export const ORG_RISK_QUESTIONS: DiagnosticQuestion[] = [
  { id: "PL-1", text: "最近1ヶ月、十分に眠れていると感じる", category: "PL", kind: "core", weight: 2.0 },
  { id: "PL-2", text: "自分の身体感覚(疲労・空腹・違和感)に気づきやすい", category: "PL", kind: "core", weight: 1.5 },
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
    title: "Section 1: 4つの動き方(26問)",
    description:
      "あなたが普段「何で動いているか」を測ります。情熱(自分の感情)/関係(周りへの感情)/洞察(経験での判断)/論理(言葉での判断)+ 人を読む力(対人カン)の26問。",
    questions: AXIS_QUESTIONS,
    field: "axis",
  },
  {
    id: "aSeparation",
    title: "Section 2: 内側と外側のギャップ(4問)",
    description:
      "「内側で感じていることを、外に出せているか」「強いストレス下で何が起きるか」を見ます。4問。",
    questions: [...A_SEPARATION_QUESTIONS, ...FZ_QUESTIONS],
    field: "aSeparation",
  },
  {
    id: "integration",
    title: "Section 3: 気づきの力(7問)",
    description:
      "感情や反応に気づき、行動を選び直せるかを測ります。考えすぎで動けない傾向も同時に確認します。7問。",
    questions: INTEGRATION_QUESTIONS,
    field: "integration",
  },
  {
    id: "responsibility",
    title: "Section 4: 強みのペア・組み合わせクセ(8問)",
    description:
      "2つの強みが結びついて他を見えなくする「クセ」を検出します。日常では強みに見えますが、特定の場面で盲点になります。8問。",
    questions: RESPONSIBILITY_QUESTIONS,
    field: "responsibility",
  },
  {
    id: "orgRisk",
    title: "Section 5: コンディション(2問)",
    description:
      "心理機能の土台となる身体・睡眠の状態を確認します。2問。",
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
