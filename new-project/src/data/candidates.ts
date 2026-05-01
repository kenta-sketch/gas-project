import type { Candidate } from "@/lib/types";

// デモ用ダミー候補者(3名 = A優位 / D優位 / B優位、タイプ判定の動作確認用)
// 各候補者は採用時 + 1年後の2時点を持つ(Option B シナリオ)
export const CANDIDATES: Candidate[] = [
  {
    id: "candidate_001",
    name: "佐藤 一郎",
    ageRange: "20代後半",
    gender: "男性",
    currentPosition: "なし(新卒中途採用候補)",
    appliedPosition: "営業職",
    presetTendency: "D優位",
    diagnoses: [
      {
        date: "2026-04-01",
        scenario: "採用時",
        answers: ["D", "D", "D", "D", "D", "B", "C", "D", "D"],
        scores: { A: 10, B: 14, C: 16, D: 23 },
        emotions: { fear: 3, sadness: 2, anger: 3, joy: 3, happiness: 3 },
        type: "理詰め型",
      },
      {
        date: "2027-04-01",
        scenario: "1年後",
        answers: ["D", "D", "D", "C", "C", "B", "C", "D", "A"],
        scores: { A: 14, B: 16, C: 19, D: 19 },
        emotions: { fear: 2, sadness: 2, anger: 2, joy: 4, happiness: 4 },
        type: "混合型",
      },
    ],
  },
  {
    id: "candidate_002",
    name: "山田 花子",
    ageRange: "20代前半",
    gender: "女性",
    currentPosition: "アシスタント1年目",
    appliedPosition: "顧客対応職",
    presetTendency: "A優位",
    diagnoses: [
      {
        date: "2026-04-01",
        scenario: "採用時",
        answers: ["A", "A", "A", "A", "A", "C", "A", "B", "A"],
        scores: { A: 23, B: 14, C: 18, D: 14 },
        emotions: { fear: 4, sadness: 4, anger: 2, joy: 5, happiness: 4 },
        type: "ワガママ型",
      },
      {
        date: "2027-04-01",
        scenario: "1年後",
        answers: ["A", "B", "A", "C", "B", "C", "A", "B", "A"],
        scores: { A: 21, B: 18, C: 19, D: 17 },
        emotions: { fear: 3, sadness: 3, anger: 1, joy: 5, happiness: 5 },
        type: "統合型",
      },
    ],
  },
  {
    id: "candidate_003",
    name: "鈴木 大輔",
    ageRange: "20代後半",
    gender: "男性",
    currentPosition: "営業3年目",
    appliedPosition: "リーダー候補",
    presetTendency: "B優位",
    diagnoses: [
      {
        date: "2026-04-01",
        scenario: "採用時",
        answers: ["B", "B", "B", "B", "B", "D", "B", "B", "B"],
        scores: { A: 14, B: 22, C: 15, D: 16 },
        emotions: { fear: 4, sadness: 3, anger: 2, joy: 4, happiness: 3 },
        type: "承認欲求型",
      },
      {
        date: "2027-04-01",
        scenario: "1年後",
        answers: ["A", "B", "C", "C", "B", "D", "B", "C", "B"],
        scores: { A: 16, B: 19, C: 19, D: 17 },
        emotions: { fear: 3, sadness: 2, anger: 2, joy: 5, happiness: 4 },
        type: "統合型",
      },
    ],
  },
];

export function findCandidate(id: string): Candidate | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
