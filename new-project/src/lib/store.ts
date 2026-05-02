"use client";

// クライアント側状態管理(デモ用、永続化は localStorage と sessionStorage)
// 応募者マスター: localStorage に「seed以外の追加分」を保存し、UIではseed+追加分をマージして表示

import type {
  AxisScores,
  EmotionScores,
  QuadType,
  AxisKey,
  Applicant,
  Settings,
  StageId,
} from "./types";
import { APPLICANTS_SEED } from "@/data/applicants";
import { DEFAULT_SETTINGS } from "@/data/settings";

// ============================================================
// 診断中のセッション(画面間で運ぶ用)
// ============================================================
export interface DiagnosisSession {
  candidateId: string; // applicant id or employee id
  scenario: "応募時" | "採用時" | "1年後" | "再診断";
  answers?: AxisKey[];
  scores?: AxisScores;
  emotions?: EmotionScores;
  type?: QuadType;
}

const DIAG_KEY = "qm-demo-session";

export function saveSession(s: DiagnosisSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DIAG_KEY, JSON.stringify(s));
}

export function loadSession(): DiagnosisSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(DIAG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DiagnosisSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DIAG_KEY);
}

// ============================================================
// 応募者マスター
// ============================================================

const APPLICANTS_LS_KEY = "qm-demo-applicants";

function readExtraApplicants(): Applicant[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(APPLICANTS_LS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Applicant[];
  } catch {
    return [];
  }
}

function writeExtraApplicants(list: Applicant[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPLICANTS_LS_KEY, JSON.stringify(list));
}

export function listApplicants(): Applicant[] {
  // seed + localStorage 追加分(後勝ち、idベース)
  const extra = readExtraApplicants();
  const merged: Record<string, Applicant> = {};
  for (const a of APPLICANTS_SEED) merged[a.id] = a;
  for (const a of extra) merged[a.id] = a;
  return Object.values(merged).sort((a, b) =>
    b.profile.appliedDate.localeCompare(a.profile.appliedDate),
  );
}

export function findApplicant(id: string): Applicant | undefined {
  return listApplicants().find((a) => a.id === id);
}

export function upsertApplicant(applicant: Applicant) {
  const extra = readExtraApplicants();
  const idx = extra.findIndex((a) => a.id === applicant.id);
  if (idx >= 0) extra[idx] = applicant;
  else extra.push(applicant);
  writeExtraApplicants(extra);
}

export function setApplicantStage(id: string, stage: StageId) {
  const a = findApplicant(id);
  if (!a) return;
  upsertApplicant({ ...a, currentStage: stage });
}

// ============================================================
// 設定
// ============================================================

const SETTINGS_LS_KEY = "qm-demo-settings";

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(SETTINGS_LS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(s));
}

export function newApplicantId(): string {
  return "app_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
