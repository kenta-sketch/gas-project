// クアッドマインド診断 完全仕様書 v1.0 に準拠
// 出典: docs/theory/notes/2026-05-11-diagnostic-spec-v1.md
// 75問体系(分岐込み): 4軸×8問=32 + G2(iA5+eA5+FZ2)=12 + G4(OB5+SW5)=10 + G3(DR/BR/AR各4)=12 + G5(AG/RV/IM各3)=9

import type { DiagnosticQuestion, EmotionKey } from "./types";

// ============================================================
// G1: 4軸 各8問(32問)
// ============================================================
export const AXIS_QUESTIONS: DiagnosticQuestion[] = [
  // A軸
  { id: "A-1", text: "気に入らないことがあると、まず身体が反応する(胸が詰まる、頭に血が上るなど)", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-2", text: "「なぜそう思うのか」を説明できなくても、好き嫌いがはっきりしている", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-3", text: "何かを始めるとき、理由より先に「やりたい」という感覚が来る", category: "axis_A", kind: "core", weight: 1.5 },
  { id: "A-4", text: "楽しいことには時間を忘れて没頭できる", category: "axis_A", kind: "support", weight: 1.0 },
  { id: "A-5", text: "怒りや興奮が、思っていたより強く出ることがある", category: "axis_A", kind: "support", weight: 1.0 },
  { id: "A-6", text: "感情が動いていないとき、行動のエネルギーが湧きにくい", category: "axis_A", kind: "support", weight: 1.0 },
  { id: "A-7", text: "感情を表に出すことは、大人として控えるべきだと思う", category: "axis_A", kind: "reverse", weight: 1.0 },
  { id: "A-8", text: "自分の感情より、場の雰囲気を優先することがほとんどだ", category: "axis_A", kind: "reverse", weight: 1.0 },
  // B軸
  { id: "B-1", text: "失敗や恥ずかしいことを見られると、頭から離れない", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-2", text: "相手が何を期待しているかを、無意識に読もうとしている", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-3", text: "断ることへの抵抗が強く、断った後も気になる", category: "axis_B", kind: "core", weight: 1.5 },
  { id: "B-4", text: "グループの中で浮いていると感じると、言動を調整したくなる", category: "axis_B", kind: "support", weight: 1.0 },
  { id: "B-5", text: "他者からの評価が上がると、自分の調子も上がる", category: "axis_B", kind: "support", weight: 1.0 },
  { id: "B-6", text: "「自分だけ違う意見を言う」ことに、エネルギーが要る", category: "axis_B", kind: "support", weight: 1.0 },
  { id: "B-7", text: "他人の目はほとんど気にならない", category: "axis_B", kind: "reverse", weight: 1.0 },
  { id: "B-8", text: "承認されなくても、自分のやり方を変えるつもりはない", category: "axis_B", kind: "reverse", weight: 1.0 },
  // C軸
  { id: "C-1", text: "理由を説明できないが、「これは違う」という感覚がある", category: "axis_C", kind: "core", weight: 1.5 },
  { id: "C-2", text: "初対面でも、相手がどんな人かを早い段階で読める", category: "axis_C", kind: "core", weight: 1.5 },
  { id: "C-3", text: "現場で「今この瞬間が勝負どころ」だと感じる瞬間がある", category: "axis_C", kind: "core", weight: 1.5 },
  { id: "C-4", text: "過去の経験から、「このパターンは危ない」と察知できる", category: "axis_C", kind: "support", weight: 1.0 },
  { id: "C-5", text: "データが出そろう前に、結論の方向性が見えることがある", category: "axis_C", kind: "support", weight: 1.0 },
  { id: "C-6", text: "言語化できないが、この判断は正しいと確信できる瞬間がある", category: "axis_C", kind: "support", weight: 1.0 },
  { id: "C-7", text: "根拠がない判断は信用しない", category: "axis_C", kind: "reverse", weight: 1.0 },
  { id: "C-8", text: "「なんとなく」で決めることは、ほぼない", category: "axis_C", kind: "reverse", weight: 1.0 },
  // D軸
  { id: "D-1", text: "行動する前に、目的・手順・想定リスクを整理したくなる", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-2", text: "同じ成果を出すなら、再現性がある方法を選ぶ", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-3", text: "感情的な判断より、論理的な根拠に基づく判断を信頼する", category: "axis_D", kind: "core", weight: 1.5 },
  { id: "D-4", text: "曖昧な状況より、ルールや基準が明確な状況の方が力を発揮できる", category: "axis_D", kind: "support", weight: 1.0 },
  { id: "D-5", text: "計画が崩れると、立て直すまでのコストが大きい", category: "axis_D", kind: "support", weight: 1.0 },
  { id: "D-6", text: "「なぜそうするのか」を説明できないプロセスには、従いたくない", category: "axis_D", kind: "support", weight: 1.0 },
  { id: "D-7", text: "計画より、その場の判断で動く方が性に合っている", category: "axis_D", kind: "reverse", weight: 1.0 },
  { id: "D-8", text: "ルールや手順は、状況次第で無視していい", category: "axis_D", kind: "reverse", weight: 1.0 },
];

// ============================================================
// G2: A発火/A表出の分離(10問+分岐2問)
// ============================================================
export const A_SEPARATION_QUESTIONS: DiagnosticQuestion[] = [
  // 内的A(5問)
  { id: "iA-1", text: "一人でいるとき、感情の波が来ることがある(喜び・怒り・悲しみなど)", category: "iA", kind: "core", weight: 1.5 },
  { id: "iA-2", text: "映画や音楽に触れると、感情が動くことが多い", category: "iA", kind: "core", weight: 1.5 },
  { id: "iA-3", text: "誰にも見られていない状況で、何かに強く反応することがある", category: "iA", kind: "support", weight: 1.0 },
  { id: "iA-4", text: "自分の内側では、強い好き嫌いがある", category: "iA", kind: "support", weight: 1.0 },
  { id: "iA-5", text: "感情が動いていないとき、何をしても平坦な感じがする", category: "iA", kind: "support", weight: 1.0 },
  // 表出A(5問)
  { id: "eA-1", text: "感じていることを、相手に伝えることができる", category: "eA", kind: "core", weight: 1.5 },
  { id: "eA-2", text: "嬉しいときに、素直に喜びを表現できる", category: "eA", kind: "core", weight: 1.5 },
  { id: "eA-3", text: "嫌なときに「嫌だ」と言える", category: "eA", kind: "support", weight: 1.0 },
  { id: "eA-4", text: "感情を出したとき、後悔することが少ない", category: "eA", kind: "support", weight: 1.0 },
  { id: "eA-5", text: "感情を出すと、関係が壊れると思うことが多い", category: "eA", kind: "reverse", weight: 1.0 },
];

// 凍結型判別(条件分岐: 内的A高 × 表出A低 のみ表示)
export const FZ_QUESTIONS: DiagnosticQuestion[] = [
  { id: "FZ-1", text: "強いストレス下で、何も感じなくなる・頭が真っ白になることがある", category: "FZ", kind: "core", weight: 1.0 },
  { id: "FZ-2", text: "過去に強い恐怖や衝撃的な経験があり、今も特定の状況で固まる感覚がある", category: "FZ", kind: "core", weight: 1.0 },
];

// ============================================================
// G4: 統合状態(Observer + 切り替え自覚)(10問)
// ============================================================
export const INTEGRATION_QUESTIONS: DiagnosticQuestion[] = [
  // Observer起動(5問)
  { id: "OB-1", text: "感情が強く動いたとき、少し間を置いてから行動できることがある", category: "OB", kind: "core", weight: 1.5 },
  { id: "OB-2", text: "「今、自分は感情的になっている」と、感情の中で気づけることがある", category: "OB", kind: "core", weight: 1.5 },
  { id: "OB-3", text: "衝動的に動きそうになったとき、一瞬止まれることがある", category: "OB", kind: "support", weight: 1.0 },
  { id: "OB-4", text: "行動した後で「あのときAで動いていた」と振り返れることがある", category: "OB", kind: "support", weight: 1.0 },
  { id: "OB-5", text: "「本当はこうしたかった」と後から気づくことが、最近減ってきた", category: "OB", kind: "support", weight: 1.0 },
  // 切り替え自覚(5問)
  { id: "SW-1", text: "論理で考えるモードと、感覚で動くモードの両方を、自分の中に感じる", category: "SW", kind: "core", weight: 1.5 },
  { id: "SW-2", text: "状況によって、自分の動き方が変わることを自覚している", category: "SW", kind: "core", weight: 1.5 },
  { id: "SW-3", text: "「今は感情より論理で判断すべき場面だ」と判断できることがある", category: "SW", kind: "support", weight: 1.0 },
  { id: "SW-4", text: "「今は分析より直感を信じていい」と思えることがある", category: "SW", kind: "support", weight: 1.0 },
  { id: "SW-5", text: "自分の反応パターンを、ある程度予測できる", category: "SW", kind: "support", weight: 1.0 },
];

// ============================================================
// G3: 責任感の3形態(12問)
// ============================================================
export const RESPONSIBILITY_QUESTIONS: DiagnosticQuestion[] = [
  // D型責任感
  { id: "DR-1", text: "ルールや約束を守ることは、状況に関わらず重要だと思う", category: "DR", kind: "core", weight: 1.0 },
  { id: "DR-2", text: "決めたことを最後まで実行することが、責任だと考える", category: "DR", kind: "core", weight: 1.0 },
  { id: "DR-3", text: "手順やプロセスが正しければ、結果が予想外でも問題ないと思える", category: "DR", kind: "core", weight: 1.0 },
  { id: "DR-4", text: "組織のルールに従うことが、自分の役割だと感じる", category: "DR", kind: "core", weight: 1.0 },
  // B型責任感
  { id: "BR-1", text: "頼まれたことは、できる限り断らないようにしている", category: "BR", kind: "core", weight: 1.0 },
  { id: "BR-2", text: "期待されていると感じると、それに応えなければという気持ちが強くなる", category: "BR", kind: "core", weight: 1.0 },
  { id: "BR-3", text: "自分の仕事が誰かの役に立っていると感じると、頑張れる", category: "BR", kind: "core", weight: 1.0 },
  { id: "BR-4", text: "失望させることへの恐れが、行動の動機になっていることがある", category: "BR", kind: "core", weight: 1.0 },
  // A型責任感
  { id: "AR-1", text: "自分がやると決めたことは、誰に言われなくてもやり切る", category: "AR", kind: "core", weight: 1.0 },
  { id: "AR-2", text: "成果が出なければ、ルールを守っていても意味がないと思う", category: "AR", kind: "core", weight: 1.0 },
  { id: "AR-3", text: "自分が「正しい」と思えないことには、責任を持てない", category: "AR", kind: "core", weight: 1.0 },
  { id: "AR-4", text: "責任を感じるのは、自分が心から関わりたいと思っている仕事だ", category: "AR", kind: "core", weight: 1.0 },
];

// ============================================================
// G5: 組織毀損プロファイル(9問)
// ============================================================
export const ORG_RISK_QUESTIONS: DiagnosticQuestion[] = [
  // 承認略奪型
  { id: "AG-1", text: "自分の成果が正当に評価されていないと感じることが多い", category: "AG", kind: "core", weight: 1.0 },
  { id: "AG-2", text: "うまくいかないとき、周囲や環境のせいだと感じることがある", category: "AG", kind: "core", weight: 1.0 },
  { id: "AG-3", text: "自分より評価されている人を見ると、腑に落ちないことがある", category: "AG", kind: "core", weight: 1.0 },
  // ルール暴力型
  { id: "RV-1", text: "感情論で話す人と議論するのは、時間の無駄だと思う", category: "RV", kind: "core", weight: 1.0 },
  { id: "RV-2", text: "ルールや論理に従わない人には、はっきり指摘すべきだと思う", category: "RV", kind: "core", weight: 1.0 },
  { id: "RV-3", text: "正しいことを言っているのに受け入れられないとき、相手の理解力を疑う", category: "RV", kind: "core", weight: 1.0 },
  // 衝動暴走型
  { id: "IM-1", text: "怒りや不満が、思っていたより強く出て後悔することがある", category: "IM", kind: "core", weight: 1.0 },
  { id: "IM-2", text: "気分によって、同じ人・同じ仕事への態度が大きく変わることがある", category: "IM", kind: "core", weight: 1.0 },
  { id: "IM-3", text: "感情が高ぶると、言ってはいけないことを言ってしまうことがある", category: "IM", kind: "core", weight: 1.0 },
];

// ============================================================
// セクション定義(応募フォームで段階表示)
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
    title: "Section 1: 4軸の傾向",
    description: "あなたの判断や行動の傾向を、4つの軸から測定します(32問)",
    questions: AXIS_QUESTIONS,
    field: "axis",
  },
  {
    id: "aSeparation",
    title: "Section 2: 感情の内的発生と外的表出",
    description: "「一人でいるとき」「見られていないとき」に限定した質問を含みます(10問)",
    questions: A_SEPARATION_QUESTIONS,
    field: "aSeparation",
  },
  {
    id: "integration",
    title: "Section 3: 切り替えと自己観察",
    description: "感情と理性のモードを切り替えられる感覚を測定します(10問)",
    questions: INTEGRATION_QUESTIONS,
    field: "integration",
  },
  {
    id: "responsibility",
    title: "Section 4: 責任感の形",
    description: "あなたが感じる責任感の起源を見ます(12問)",
    questions: RESPONSIBILITY_QUESTIONS,
    field: "responsibility",
  },
  {
    id: "orgRisk",
    title: "Section 5: 組織内での反応傾向",
    description: "ストレス下や評価場面での反応パターンを確認します(9問)",
    questions: ORG_RISK_QUESTIONS,
    field: "orgRisk",
  },
];

// ============================================================
// 5感情自己評価(各1〜5)
// ============================================================
export const EMOTION_QUESTIONS: { key: EmotionKey; text: string }[] = [
  { key: "fear", text: "現在、どの程度「不安」を感じていますか?" },
  { key: "sadness", text: "現在、どの程度「悲しみ」を感じていますか?" },
  { key: "anger", text: "現在、どの程度「怒り」を感じていますか?" },
  { key: "joy", text: "現在、どの程度「喜び」を感じていますか?" },
  { key: "happiness", text: "現在、どの程度「幸福」を感じていますか?" },
];

// 旧 Q1-Q9 互換性のため残す(削除予定)
export const QUESTIONS = AXIS_QUESTIONS;
