import type { Question } from "./types";

// Q1-Q9 (友人作成質問群を簡略化したデモ用版)
// 本番ではマスター構造図のギャップ4項目(癌候補検出/責任感3形態/統合状態/後付け項目)を埋める拡張が必要
export const QUESTIONS: Question[] = [
  {
    id: "Q1",
    text: "新しい仕事を任された時、最初にあなたが取る行動はどれに近いですか?",
    options: [
      { axis: "A", label: "とりあえず始めて、進めながら感覚で調整する" },
      { axis: "B", label: "まず周囲やリーダーの意向を確認する" },
      { axis: "C", label: "過去の似た仕事を思い出して当たりをつける" },
      { axis: "D", label: "目的・要件・期限を整理してから着手する" },
    ],
  },
  {
    id: "Q2",
    text: "判断に迷った時、最も決め手になりやすいのは?",
    options: [
      { axis: "A", label: "その場の空気・直感的な違和感" },
      { axis: "B", label: "他者から見てどう映るか" },
      { axis: "C", label: "過去の経験で似たケースの結果" },
      { axis: "D", label: "メリット・デメリットの比較分析" },
    ],
  },
  {
    id: "Q3",
    text: "あなたを最も奮い立たせるものは?",
    options: [
      { axis: "A", label: "心が動く瞬間や情熱を感じる対象" },
      { axis: "B", label: "誰かから期待されている / 認められている実感" },
      { axis: "C", label: "うまくいきそうな予感・流れの良さ" },
      { axis: "D", label: "明確な目標と達成プラン" },
    ],
  },
  {
    id: "Q4",
    text: "リスクや不確実性に直面した時の傾向は?",
    options: [
      { axis: "A", label: "まず感じる。怖いか、ワクワクするかで身体が決める" },
      { axis: "B", label: "周囲のリスク許容度を見て自分の許容度を合わせる" },
      { axis: "C", label: "嗅覚的に「これは行ける」「これは危ない」がわかる" },
      { axis: "D", label: "発生確率と影響度を見積もって判断する" },
    ],
  },
  {
    id: "Q5",
    text: "誰かと意見が食い違った時、最初に出る反応は?",
    options: [
      { axis: "A", label: "感情がそのまま顔や声に出る" },
      { axis: "B", label: "対立を避けて場を収めようとする" },
      { axis: "C", label: "相手の言いたい本質を汲み取ろうとする" },
      { axis: "D", label: "論点を整理して建設的に議論する" },
    ],
  },
  {
    id: "Q6",
    text: "達成感を最も強く感じるのはどんな時?",
    options: [
      { axis: "A", label: "自分の心が満たされる瞬間" },
      { axis: "B", label: "他者から評価された / 認められた時" },
      { axis: "C", label: "勘が当たって流れに乗れた時" },
      { axis: "D", label: "立てた計画通りに成果が出た時" },
    ],
  },
  {
    id: "Q7",
    text: "うまくいかない時、最初に取る行動は?",
    options: [
      { axis: "A", label: "感情を一旦受け止めて、整うまで待つ" },
      { axis: "B", label: "誰かに相談して気持ちを整理する" },
      { axis: "C", label: "原因を直感的に探って、試行錯誤する" },
      { axis: "D", label: "原因をリスト化して、要因分析する" },
    ],
  },
  {
    id: "Q8",
    text: "あなたが最もエネルギーを使うことは?",
    options: [
      { axis: "A", label: "感情のコントロール" },
      { axis: "B", label: "他者からどう見えるかを意識すること" },
      { axis: "C", label: "微妙な違和感を放置せず追うこと" },
      { axis: "D", label: "情報の整理と意思決定" },
    ],
  },
  {
    id: "Q9",
    text: "ポジティブな出来事を思い出してください。なぜそれが良かったと感じますか?",
    options: [
      { axis: "A", label: "心が震える感覚があったから" },
      { axis: "B", label: "周囲から認められた / 喜ばれたから" },
      { axis: "C", label: "流れに乗れた / タイミングが合ったから" },
      { axis: "D", label: "目標を達成できたから" },
    ],
  },
];

export const EMOTION_QUESTIONS: { key: import("./types").EmotionKey; text: string }[] = [
  { key: "fear", text: "現在、どの程度「不安」を感じていますか?" },
  { key: "sadness", text: "現在、どの程度「悲しみ」を感じていますか?" },
  { key: "anger", text: "現在、どの程度「怒り」を感じていますか?" },
  { key: "joy", text: "現在、どの程度「喜び」を感じていますか?" },
  { key: "happiness", text: "現在、どの程度「幸福」を感じていますか?" },
];
