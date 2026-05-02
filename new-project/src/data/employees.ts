import type { Employee } from "@/lib/types";

// 採用済み社員(=マネジメント対象)。既存の3名(佐藤/山田/鈴木)を移設
export const EMPLOYEES_SEED: Employee[] = [
  {
    id: "emp_001",
    fullName: "佐藤 一郎",
    ageRange: "20代後半",
    gender: "男性",
    hireDate: "2026-04-01",
    currentRole: "営業職",
    manager: "セールス責任者 大島",
    presetTendency: "D優位",
    status: "在籍",
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
    id: "emp_002",
    fullName: "山田 花子",
    ageRange: "20代前半",
    gender: "女性",
    hireDate: "2026-04-01",
    currentRole: "顧客対応職",
    manager: "CS責任者 三浦",
    presetTendency: "A優位",
    status: "在籍",
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
    id: "emp_003",
    fullName: "鈴木 大輔",
    ageRange: "20代後半",
    gender: "男性",
    hireDate: "2026-04-01",
    currentRole: "営業3年目 → リーダー候補",
    manager: "セールス責任者 大島",
    presetTendency: "B優位",
    status: "在籍",
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

export function findEmployee(id: string): Employee | undefined {
  return EMPLOYEES_SEED.find((e) => e.id === id);
}
