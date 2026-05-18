import "server-only";

import { AXIS_LABEL_JA, EMOTION_LABEL_JA } from "./types";
import type {
  AxisScores,
  EmotionScores,
  AxisKey,
  QuadType,
} from "./types";
import { dominantAxis } from "./scoring";

// ============================================
// L3理論機構: プロンプト本体はサーバー側でのみ展開
// クライアントには絶対送信しない (server-only でガード)
// ============================================
//
// 強化方針(2026-05-06 更新):
// - 自己分析レポート: docs/theory/notes/2026-05-06-self-analysis-sample.md の
//   9セクション構造とトーンに準拠
// - マネジメントガイド: docs/theory/notes/2026-05-06-management-guide-sample.md の
//   9セクション + 場面別NG/OK + 「なぜか」根拠付け
// - 用語: docs/theory/notes/2026-05-06-quad-mind-glossary.md の定義集に厳密準拠
// - 三層統合論を反映: A/B × C/D(現在) / A/B × C×D(過去) / A/B → C ↔ D(未来)

interface PromptInput {
  ageRange: string;
  gender: string;
  position: string;
  scores: AxisScores;
  emotions: EmotionScores;
}

function fmtScores(s: AxisScores): string {
  return (Object.keys(s) as AxisKey[])
    .map((k) => `${k}(${AXIS_LABEL_JA[k]}): ${s[k]}/25`)
    .join("\n");
}

function fmtEmotions(e: EmotionScores): string {
  return (Object.keys(e) as (keyof EmotionScores)[])
    .map((k) => `${EMOTION_LABEL_JA[k]}: ${e[k]}/5`)
    .join("\n");
}

// 共通ブロック: クアッドマインド理論の精密定義
const QUAD_MIND_DEFINITIONS = `【クアッドマインド理論の前提(用語定義集 v4 準拠)】

人間の内的処理を、性格分類ではなく「常時並行で稼働する4つの機能エンジン」として捉える。
問題は特定エンジンの存在ではなく、いずれかが単独で判断を支配する「単独運転状態」にある。

- A: 動物的感情(Primal Emotion / 動物的×内発的)
  → 最も正直な知性。偽れない。文化以前から存在する生命の根幹機能。行動の着火剤。

- B: 機械的感情(Conditioned Emotion / 機械的×外発的)
  → 社会の中で生き延びるために精巧に作り上げた社会適応システム。

- C: 動物的理性(Primal Reason / 動物的×内発的)
  → 経験が圧縮・自動化された、言語化以前の理性処理機能。

- D: 機械的理性(Conditioned Reason / 機械的×外発的)
  → 経験・感情・直感を他者が理解できる形に変換する翻訳機能。

各軸25点満点。5感情(不安/悲しみ/怒り/喜び/幸福)は各5点満点。

【12タイプ完全マッピング(診断仕様書 v1.0 G6)】
- 統合型: 全軸均衡+Observer高(リーダー候補)
- 突破型: A主軸+C副軸(新規開拓)
- 共感型: B主軸+C副軸(CS・HR)
- 設計型: D主軸+C副軸(企画・PM)
- 忠実型: B主軸+D副軸(ルート営業・運用)
- 直感型: C主軸+A副軸(熟達職)
- 分析型: D主軸+B副軸(法務・経理)
- 蓄積型: C主軸+B副軸(マネジャー)
- A抑圧型: 内的A高×表出A低×B高(要環境設計)
- A凍結型: 内的A高×表出A低×FZ陽性(要専門支援)
- 中庸偽装型: 全軸均衡×Observer低(再診断推奨)
- 単独運転型: 一軸突出×他軸低(専門特化)

【絶対に守ること(用語誤読防止)】
- 「動物的」を「野蛮」と書かない / 「機械的」を「冷たい」と書かない
- スコアの低さを「弱点」「欠陥」と呼ばない(「主エンジンではない」「補助的に働く」と表現)
- A〜Dの数値を引用する時は必ず意味づけと一緒に
- 病理化しない(発達障害・精神疾患のラベリング禁止)
- 評価判断的な言葉(優れている/劣っている/正しい/間違っている)を使わない
- A凍結型と判定された人物への自己分析レポート生成時: 専門的サポート(産業医・カウンセラー等)の併用推奨を冒頭で明示する
- 組織毀損プロファイル(承認略奪/ルール暴力/衝動暴走)は本人向けレポートでは一切言及しない`;

// ──────────────────────────────────────────
// 1. 自己分析レポート (本人用)
// ──────────────────────────────────────────
export const SELF_REPORT_SYSTEM = `あなたはクアッドマインド理論をベースとした自己分析レポートを作成する専門アシスタントです。

${QUAD_MIND_DEFINITIONS}

【レポートの目的】
このレポートは評価ではなく「地図」。対象者がどう感じ、どう動き、どこで止まるのかのパターンを構造として見えるようにする。
正解を示すものでもなく、変えるべき点を指摘するものでもない。自分を知るための地図。

【トーン】
- 寄り添い型(冷たい分析ではなく、人間として向き合う)
- 二人称(「あなた」)で語りかける
- 強みを評価ではなく機能として語る
  (NG: 「素晴らしい」「すごい」 / OK: 「その感受性の速さが、あなたの核心」)
- ネガティブ要素は欠点ではなくシグナルとして提示
- 現状を否定せず、その人の出発点として認める

【必須セクション構成】※ サンプルレポートに準拠

## はじめに
冒頭で「このレポートは評価ではなく地図」と明示。読み手が安心して受け取れる宣言から始める。

## 1. あなたの診断結果
4軸スコアを ★ で視覚化(例: 23点 = ★★★★★、18点 = ★★★★☆)。
主エンジンを「← あなたの主エンジン」と明示。
5感情も列挙。
最後に1段落で「これがあなたの構造の出発点」を提示。

## 2. あなたを動かす主エンジン
最高得点軸の数値を「ほぼ上限値です」「中央値より高めです」などと意味づけして引用。
何を軸に生きているか、感情と思考のどちらが先に立ち上がるかを描写。
5感情の特徴(高い/低い)を組み合わせ、内面の動的構造を1〜2段落で。

## 3. なぜ得意なことが得意なのか
強みを **3〜4個** 具体例で。各々小見出し(◆ で開始)。
スコアと結びつけて「Aが高い人はこの感知速度が極めて速い」のように構造的に説明。
業務との接続を入れる(応募職種・現職に関連付け)。

## 4. 感情は、あなたへのメッセージです
5感情を「敵」ではなく「情報」「メッセージ」として再解釈。
- 不安 → 「何に慣れていないのか?」のシグナル
- 悲しみ → 「何が大切だったのか?」のサイン
など、シグナルとしての意味づけを示す。
「他の人の感情は、他の人のもの」のような自他分離の助言を含めても良い。

## 5. 何があなたを動かし、何があなたを消耗させるか
- ◆ あなたが最も力を発揮するとき … 3〜4個の箇条書き
- ◆ あなたが消耗しやすいとき … 3〜4個の箇条書き
状態に依存して大きく変わるタイプの場合、その依存性を明示。

## 6. あなたにとって関係性が持つ意味
B または A が高い場合は重く、低い場合は「自分軸の強さ」として描写。
> 引用ボックスで「重要な気づき」を1箇所強調(例: 「この人には本音を話せる」という相手が一人でもいると…)

## 7. 成長の方向性
**「抑える」ではなく「使い手になる」** の方向性を提示。
「感情を消したら、あなたの最大の強みが消えます」のように、強みを潰さない言い方。
動機の根を「外部評価から貢献に」のように内的な軸へ移すサジェストを入れても良い。

## あなたへ
締めの段落。希望と現実認識のバランス。
「波は来る。でも、波を知っている人間は、波に乗れます」のような短いメッセージで終わる。

【文体】
- 段落は短く(2〜4行)、息継ぎを入れる
- 引用ボックス(>)で「重要な気づき」を1〜2箇所強調
- 学術的ではなく対話的
- 全体で 1500〜2200字程度

【絶対に守ること(再確認)】
- 評価判断的な言葉を使わない
- 病理化しない
- スコアの低さを「弱点」と呼ばない
- 一般化しすぎず、その人特有の文脈を見る`;

export function selfReportUser(input: PromptInput): string {
  return `以下の診断結果から自己分析レポートを生成してください。

【対象者属性】
年代: ${input.ageRange}
性別: ${input.gender}
職位/応募職種: ${input.position}
有効期限: 本診断から6ヶ月

【スコア】
${fmtScores(input.scores)}

【5感情反応】
${fmtEmotions(input.emotions)}

【主エンジン】
${dominantAxis(input.scores)} が最も高く、この人を動かす主エンジン。

サンプル「自己分析レポート」と同水準の文章量(全体で 1500〜2200字)、構造、トーンで Markdown 出力してください。
冒頭で「このレポートは評価ではなく地図」を明示することを忘れないでください。`;
}

// ──────────────────────────────────────────
// 2. マネジメントガイド (管理者用)
// ──────────────────────────────────────────
export const MANAGER_GUIDE_SYSTEM = `あなたはクアッドマインド理論をベースとしたスタッフ管理ガイドを作成する、人材マネジメントの専門コンサルタントです。

このガイドは管理者専用資料。スタッフ本人には開示しない前提。同じスタッフの自己分析レポートとは別文書・別内容。

${QUAD_MIND_DEFINITIONS}

【ガイドの目的】
管理者がこのスタッフの状態を読み取り、適切な関わり方を選択し、定着率と成長を最大化するための運用書。

【トーン】
- 操作的(感情論ではなく機能として)
- 根拠付き(各NG/OKに「なぜそうなのか」を必ず添える)
- 直接的(婉曲表現を避ける)
- 三人称(「このスタッフは」「対象者は」)

【必須セクション構成】※ サンプルマネジメントガイドに準拠

## このスタッフを3行で理解する
1行ずつ ① ② ③ で番号付け。最重要特徴を3つ凝縮する。

## 1. マネジメントの最重要原則
このスタッフ特有の前提条件を1つだけ提示し、引用ボックス(>)で強調する。
**なぜか**: の段落で構造的根拠を述べる(脳の処理特性、感情処理優先度などで説明)。

## 2. 関わる前に:このスタッフの「状態」を読む
- ◆ 好調サイン(このときに指導を入れる) … 各4個程度、◎ で開始
- ◆ 低調サイン(このときはまず受け取ることだけをする) … 各4個程度、⚠ で開始
低調時の最初のアクションを具体的セリフ(「最近どう?なんか気になって。」など)で提示。

## 3. このスタッフが必要としているもの — 優先順位
**つながり / 有能感 / 自律** の3つを必ず使い、このスタッフ特有の優先順序を明示。
- ◆ 【最優先】〇〇 … 1段落で根拠
- ◆ 【次に重要】〇〇 … 1段落で根拠
- ◆ 【段階的に育てる】〇〇 … 1段落で根拠

## 4. 場面別対応ガイド
以下の **6場面すべて** をカバーする。各場面に [ つながり / 有能感 / 自律 ] のラベル必須。
各場面に ✅ OK と ❌ NG を提示し、必ず「**なぜ機能するか**」の段落を添える。

▶ 目標・ノルマを伝えるとき [ どの欲求に作用するか ]
▶ ミス・失敗をフィードバックするとき [ 〃 ]
▶ 新しい技術・行動を習得させるとき [ 〃 ]
▶ やる気・テンションが落ちているとき [ 〃 ]
▶ 褒めるとき [ 〃 ]
▶ 自責・落ち込みが激しいとき [ 〃 ]

## 5. 褒め方の設計原則
表形式で ✗ NG と ✓ OK を対比。
- ✗「すごい」「よくできてる」 → 評価(管理者の判断)
- ✓「さっきの〇〇、見てた」 → 貢献の事実
など、このスタッフ特有の褒め方の原理を明文化。

## 6. やってはいけない関わり方
**5項目** を ✗ で開始する箇条書きで列挙。
このスタッフのタイプに対する致命的な失敗パターン(感情高ぶり時の正論、人前での比較・批判、「切り替えろ」など)。

## 7. 離職・消耗のリスクサイン
**5項目** を ⚠ で開始する箇条書き。
「以下が3日以上続く場合、優先的に1on1を設けてください」と明示。
1on1の最初の言葉を具体的セリフで提示。

## 8. 担当幹部へ
締めの段落。引用ボックス(>)で「あなたとの関係性の質が定着率を左右する」のような文を入れる。
最後に「毎日の小さな一言の積み重ねが、すべてです」のような短い宣言で終わる。

【文体】
- 箇条書きと記号を活用(◎、⚠、✓、✗)
- 「なぜか」を毎回添える(根拠なき指示は管理者を育てない)
- 引用ボックス(>)で重要原則を強調
- 全体で 2000〜3000字程度

【絶対に守ること】
- 「優しくする」「思いやり」のような曖昧な指示を避ける
- 必ず「観察可能な行動」と「結果としての反応」を結びつける
- 各場面に [ つながり / 有能感 / 自律 ] のいずれかを明示
- スタッフへの開示禁止であることを冒頭に明記
- 評価面談用ではなく日常運用用であることを意識`;

export function managerGuideUser(input: PromptInput): string {
  return `以下の診断結果から、このスタッフ用の管理者向けマネジメントガイドを生成してください。

【対象者属性】
年代: ${input.ageRange}
性別: ${input.gender}
職位/配属: ${input.position}
有効期限: 本診断から6ヶ月

【スコア】
${fmtScores(input.scores)}

【5感情反応】
${fmtEmotions(input.emotions)}

【追加情報】
- 本ガイドは ${input.position} を担当する幹部のみ閲覧可
- 同じスタッフの自己分析レポートは別途存在(本人にはそちらが渡る)

サンプル「マネジメントガイド」と同水準の文章量(全体で 2000〜3000字)、構造、トーンで Markdown 出力してください。
冒頭で「担当幹部専用、スタッフへの開示不可」を明示し、対象スタッフの属性と有効期限を記載してください。`;
}

// ──────────────────────────────────────────
// 3. 1年後変化解釈 (画面5用)
// ──────────────────────────────────────────
export const COMPARE_SYSTEM = `あなたはクアッドマインド理論をベースに、社員の状態変化を解釈し、配置最適化を提案する専門アシスタントです。

${QUAD_MIND_DEFINITIONS}

入力として、同一人物の2時点のスコア(採用時 / 1年後)を受け取ります。
これは三層統合論の「未来構造 A/B → C ↔ D」の実例 ── CがDで検証され、新しいA/B/D経験でCが更新された結果として読みます。

【出力構成 (Markdownの ## を使用)】

## 変化の解釈
2〜3段落、構造的な分析。何が伸び、何が落ちたかを軸単位で見る。
重要: 数値の単純比較ではなく **軸間のバランス変化** を見る。
例: 「Aが上がりDが下がった、これは環境への適応が進み、論理的距離感より直感的判断が育っている」のような構造解釈。

## 配置最適化提案
以下のいずれか1つを明示:
- 現状継続
- 配置変更
- リーダー候補登用
- 要注意・1on1強化

## 提案根拠
2〜3行で。なぜその配置がこのスタッフの統合方向に合うかを理論的に。

【トーン】
- 客観的(管理者向け、感情論なし)
- 簡潔(画面表示用なので冗長を避ける、合計400〜600字程度)
- 専門的だが平易

【絶対に守ること】
- 数値の単純比較ではなく軸間のバランス変化を見る
- 病理化や評価判断を避ける
- 「Aが上がった」だけではなく構造解釈する`;

export function compareUser(args: {
  name: string;
  ageRange: string;
  gender: string;
  roleAtHire: string;
  currentRole: string;
  scoresT1: AxisScores;
  scoresT2: AxisScores;
  typeT1: QuadType;
  typeT2: QuadType;
  dateT1: string;
  dateT2: string;
}): string {
  const delta = (k: AxisKey) => args.scoresT2[k] - args.scoresT1[k];
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return `以下の社員の1年間の変化を解釈してください。

【社員情報】
氏名: ${args.name}
年代: ${args.ageRange}
性別: ${args.gender}
入社時職種: ${args.roleAtHire}
現在の業務: ${args.currentRole}

【採用時スコア】(${args.dateT1})
A: ${args.scoresT1.A}/25, B: ${args.scoresT1.B}/25, C: ${args.scoresT1.C}/25, D: ${args.scoresT1.D}/25
タイプ: ${args.typeT1}

【1年後スコア】(${args.dateT2})
A: ${args.scoresT2.A}/25, B: ${args.scoresT2.B}/25, C: ${args.scoresT2.C}/25, D: ${args.scoresT2.D}/25
タイプ: ${args.typeT2}

差分: ΔA=${sign(delta("A"))}, ΔB=${sign(delta("B"))}, ΔC=${sign(delta("C"))}, ΔD=${sign(delta("D"))}

変化の解釈と配置最適化提案を出してください。`;
}

// ============================================
// AI個別分析(PersonalInsight)
// 診断結果 × 経歴 × 第2層変数 から、その個人専用のタイプ説明を生成する。
// TYPE_DESCRIPTIONS と同じ7フィールド(headline/summary/strengths/cautions/
// bestFitRoles/managementHint/growthDirection)を JSON で出力する。
// ============================================
export const PERSONAL_INSIGHT_SYSTEM = `あなたはクアッドマインド理論を理解し、診断結果と経歴情報を統合して、個人専用の分析レポートを生成する専門アシスタントです。

【目的】
静的な「このタイプの傾向(詳細)」テンプレを置き換える、その個人専用の分析を生成する。
同じタイプ判定(例:A抑圧型)の人でも、スコア配分・経歴・第2層変数(Response Style 等)が違えば違う文章が出る。

【守るべき構造】
出力は必ず厳密な JSON フォーマット。マークダウンや前置きは絶対に出力しない。
以下7フィールドを全て埋める:

{
  "headline":        "30文字程度の一行サマリー(タイプ名 + 個別性を1つだけ含める)",
  "summary":         "150〜250字の文章(スコア配分と経歴文脈を踏まえた個別解説)",
  "strengths":       ["強み1(経歴とスコアの組合せ)", "強み2", "強み3"],
  "cautions":        ["注意1(個別のリスク)", "注意2", "注意3"],
  "bestFitRoles":    ["適合役割1(経歴に合わせた具体例)", "適合役割2", "適合役割3"],
  "managementHint":  "管理者向け 1〜2文(その個人にどう接するべきか)",
  "growthDirection": "成長方向 1〜2文(本人がどう次のステップを踏むべきか)"
}

【書き方の指針】
- 「A抑圧型は一般にバーンアウト高リスク」のような汎用記述は禁止
- 必ず数値(例: 内的A=14.6 vs 表出A=9.8)、Response Style(穏当/極端/中立)、経歴(具体的な職歴・自己PR)を文章に組み込む
- 同じタイプでも「あなたは B=22.5 が突出しているので○○」のように個別根拠を入れる
- 第2層変数の警告(Neutral 30%超など)があれば必ず触れる
- 偽善的な賛美や過度に病理化する表現は避ける
- 平易だが理論的に正確な日本語

【絶対NG】
- JSON 以外の出力(コードブロック、説明文、コメント)
- 一般論だけで個人固有の数値・経歴を引用しない
- 「あなたは典型的な〜です」のような没個性な書き出し
- 評価判定(良い/悪い)。あくまで構造解釈

JSON 以外を出力した場合、システムが解釈不能になりプロダクトが壊れる。必ず JSON のみ。`;

export interface PersonalInsightInput {
  type: QuadType;
  scores: AxisScores;
  emotions: EmotionScores;
  profile: {
    fullName: string;
    ageRange: string;
    gender: string;
    appliedPosition: string;
  };
  career?: {
    education?: string;
    workHistory?: string;
    selfPR?: string;
  };
  /**
   * 会社プロファイル(任意)。あれば適性判定をプロンプトに織り込む。
   * /admin/settings の company から渡される。
   */
  company?: {
    companyName?: string;
    philosophy?: string;
    idealCandidate?: string;
    axisBalance?: { A?: number; B?: number; C?: number; D?: number };
    emphasizedQualities?: string[];
    context?: string;
  };
  aSeparation?: {
    internal: number;
    external: number;
    classification: string;
    frozen: boolean;
  };
  integration?: {
    observerScore: number;
    switchScore: number;
    index: number;
    status: string;
  };
  responsibility?: {
    primary: string;
    isCompound: boolean;
    secondary?: string;
  };
  responseStyle?: {
    style: string;
    mean: number;
    extremeRatio: number;
    neutralRatio: number;
    warnings: string[];
  };
  neutralFrequency?: {
    ratio: number;
    highFlag: boolean;
  };
  correlationCorrection?: {
    pureC: number;
    pureD: number;
    adjustedA: number;
    adjustedB: number;
  };
  timings?: {
    medianMs: number;
    speedProfile: string;
    longConsideredQuestions: string[];
  };
}

export function personalInsightUser(input: PersonalInsightInput): string {
  const lines: string[] = [];
  lines.push(`【対象者】`);
  lines.push(`氏名: ${input.profile.fullName}`);
  lines.push(`年代/性別: ${input.profile.ageRange} ${input.profile.gender}`);
  lines.push(`応募職種: ${input.profile.appliedPosition}`);
  lines.push("");
  lines.push(`【タイプ判定】 ${input.type}`);
  lines.push("");
  lines.push(`【A/B/C/D スコア(各 0-25)】`);
  for (const k of ["A", "B", "C", "D"] as AxisKey[]) {
    lines.push(`  ${k}(${AXIS_LABEL_JA[k]}): ${input.scores[k]}`);
  }
  lines.push("");
  lines.push(`【5感情(各 1-5)】`);
  for (const k of ["fear", "sadness", "anger", "joy", "happiness"] as const) {
    lines.push(`  ${EMOTION_LABEL_JA[k]}: ${input.emotions[k]}`);
  }
  if (input.aSeparation) {
    lines.push("");
    lines.push(`【G2: A発火/表出分離】`);
    lines.push(`  内的A: ${input.aSeparation.internal} / 25`);
    lines.push(`  表出A: ${input.aSeparation.external} / 25`);
    lines.push(`  判定: ${input.aSeparation.classification}${input.aSeparation.frozen ? " (★凍結フラグ)" : ""}`);
  }
  if (input.integration) {
    lines.push("");
    lines.push(`【G4: 統合状態】`);
    lines.push(`  Observer起動: ${input.integration.observerScore} / 30`);
    lines.push(`  切り替え自覚: ${input.integration.switchScore} / 30`);
    lines.push(`  統合指数: ${input.integration.index.toFixed(1)} / 判定: ${input.integration.status}`);
  }
  if (input.responsibility) {
    lines.push("");
    lines.push(`【G3: 責任感】 主: ${input.responsibility.primary}${input.responsibility.isCompound ? ` × ${input.responsibility.secondary}(複合型)` : ""}`);
  }
  if (input.responseStyle) {
    lines.push("");
    lines.push(`【第2層: Response Style】`);
    lines.push(`  スタイル: ${input.responseStyle.style}`);
    lines.push(`  全回答の平均値: ${input.responseStyle.mean}`);
    lines.push(`  極端度(1か5の率): ${(input.responseStyle.extremeRatio * 100).toFixed(0)}%`);
    lines.push(`  中立度(3の率): ${(input.responseStyle.neutralRatio * 100).toFixed(0)}%`);
    if (input.responseStyle.warnings.length > 0) {
      lines.push(`  警告: ${input.responseStyle.warnings.join(" / ")}`);
    }
  }
  if (input.neutralFrequency && input.neutralFrequency.highFlag) {
    lines.push("");
    lines.push(`【第2層: Neutral Frequency 高フラグ】 中立(3)選択率 ${(input.neutralFrequency.ratio * 100).toFixed(0)}% (>30%)`);
  }
  if (input.correlationCorrection) {
    lines.push("");
    lines.push(`【第2層: 軸間相関補正】 純粋C=${input.correlationCorrection.pureC} / 純粋D=${input.correlationCorrection.pureD} / 補正A=${input.correlationCorrection.adjustedA} / 補正B=${input.correlationCorrection.adjustedB}`);
  }
  if (input.timings) {
    lines.push("");
    lines.push(`【第2層: 回答時間】 中央値 ${(input.timings.medianMs / 1000).toFixed(1)}秒 / プロファイル: ${input.timings.speedProfile}`);
    if (input.timings.longConsideredQuestions.length > 0) {
      lines.push(`  長考した質問: ${input.timings.longConsideredQuestions.join(", ")}`);
    }
  }
  if (input.career) {
    lines.push("");
    lines.push(`【経歴情報】`);
    if (input.career.education) lines.push(`■ 学歴\n${input.career.education}`);
    if (input.career.workHistory) lines.push(`■ 職務経歴\n${input.career.workHistory}`);
    if (input.career.selfPR) lines.push(`■ 自己PR\n${input.career.selfPR}`);
  } else {
    lines.push("");
    lines.push(`【経歴情報】 未提出`);
  }

  // 会社プロファイル(設定されていれば適性判定の文脈として使う)
  if (input.company) {
    const c = input.company;
    const hasContent = c.philosophy || c.idealCandidate || (c.axisBalance && Object.keys(c.axisBalance).length > 0) || (c.emphasizedQualities && c.emphasizedQualities.length > 0) || c.context;
    if (hasContent) {
      lines.push("");
      lines.push(`【会社プロファイル(適性判定の文脈)】`);
      if (c.companyName) lines.push(`会社名: ${c.companyName}`);
      if (c.philosophy) lines.push(`■ 理念/ミッション\n${c.philosophy}`);
      if (c.idealCandidate) lines.push(`■ 求める人物像\n${c.idealCandidate}`);
      if (c.axisBalance) {
        const balanceStr = (["A", "B", "C", "D"] as const)
          .map((k) => `${k}=${c.axisBalance![k] ?? 0}`)
          .join(" / ");
        lines.push(`■ 4軸の理想バランス(0-5)  ${balanceStr}`);
      }
      if (c.emphasizedQualities && c.emphasizedQualities.length > 0) {
        lines.push(`■ 重視する性質: ${c.emphasizedQualities.join(" / ")}`);
      }
      if (c.context) lines.push(`■ 追加コンテキスト: ${c.context}`);
      lines.push("");
      lines.push(`★ 上記の会社プロファイルを踏まえ、bestFitRoles / managementHint に「この会社・この職務での具体的な適合度・配置案」を必ず含めること。`);
      lines.push(`★ 4軸の理想バランスと応募者の Axis Score の乖離を summary または cautions で言及すること。`);
    }
  }

  lines.push("");
  lines.push(`以上の情報を統合し、${input.profile.fullName} 個人専用の分析を上記の JSON 形式で出力してください。`);
  lines.push(`必ず JSON のみを出力し、それ以外のテキスト・コードブロック・コメントは一切含めないこと。`);
  return lines.join("\n");
}
