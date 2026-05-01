"use client";

// 軽量グローバルstore (デモ用、永続化なし)
// 画面遷移間でセッション状態を保持するために sessionStorage を使う

import type { AxisScores, EmotionScores, QuadType, AxisKey } from "./types";

export interface SessionState {
  candidateId: string;
  scenario: "採用時" | "1年後";
  answers?: AxisKey[];
  scores?: AxisScores;
  emotions?: EmotionScores;
  type?: QuadType;
}

const KEY = "qm-demo-session";

export function saveSession(s: SessionState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function loadSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
