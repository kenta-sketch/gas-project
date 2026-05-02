import type { Settings } from "@/lib/types";

// 既定の企業設定。Settings画面で編集可能。
export const DEFAULT_SETTINGS: Settings = {
  inputMode: "both",
  stageLabels: {
    applied: "応募",
    selection_1: "1次選考",
    selection_2: "2次選考",
    selection_final: "最終選考",
    hired: "合格",
    rejected: "不採用",
  },
  stageOrder: [
    "applied",
    "selection_1",
    "selection_2",
    "selection_final",
    "hired",
    "rejected",
  ],
};
