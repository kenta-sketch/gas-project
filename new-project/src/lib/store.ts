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
  StandaloneDiagnosis,
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

// ============================================================
// 社員マスター(seed + localStorage 上書き分)
// 社員データは原則 seed だが、診断追加・レポートキャッシュ等で
// 編集が必要なため、localStorage に上書き分を保存しマージする
// ============================================================
import type { Employee, OneOnOne } from "./types";
import { EMPLOYEES_SEED, ONE_ON_ONES_SEED } from "@/data/employees";

const EMPLOYEES_LS_KEY = "qm-demo-employee-overrides";

function readEmployeeOverrides(): Record<string, Employee> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(EMPLOYEES_LS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Employee>;
  } catch {
    return {};
  }
}

function writeEmployeeOverrides(overrides: Record<string, Employee>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EMPLOYEES_LS_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage 容量超過などは黙って続行
  }
}

export function listEmployees(): Employee[] {
  // seed をベースに、override で上書き(同 id があれば override 優先)
  const overrides = readEmployeeOverrides();
  return EMPLOYEES_SEED.map((e) => overrides[e.id] ?? e);
}

export function findEmployeeMerged(id: string): Employee | undefined {
  return listEmployees().find((e) => e.id === id);
}

export function upsertEmployee(employee: Employee) {
  const overrides = readEmployeeOverrides();
  overrides[employee.id] = employee;
  writeEmployeeOverrides(overrides);
}

// ============================================================
// スタンドアロン診断(/diagnose 経由)
// 応募者/社員に紐づかない、純粋な診断レコード
// ============================================================
const STANDALONE_LS_KEY = "qm-standalone-diagnoses";

export function listStandaloneDiagnoses(): StandaloneDiagnosis[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STANDALONE_LS_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as StandaloneDiagnosis[];
    return [...arr].sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function findStandaloneDiagnosis(id: string): StandaloneDiagnosis | undefined {
  return listStandaloneDiagnoses().find((d) => d.id === id);
}

export function upsertStandaloneDiagnosis(diagnosis: StandaloneDiagnosis) {
  if (typeof window === "undefined") return;
  const list = listStandaloneDiagnoses();
  const idx = list.findIndex((d) => d.id === diagnosis.id);
  if (idx >= 0) list[idx] = diagnosis;
  else list.push(diagnosis);
  try {
    window.localStorage.setItem(STANDALONE_LS_KEY, JSON.stringify(list));
  } catch {
    // localStorage 容量超過は黙って続行
  }
}

export function deleteStandaloneDiagnosis(id: string) {
  if (typeof window === "undefined") return;
  const list = listStandaloneDiagnoses().filter((d) => d.id !== id);
  try {
    window.localStorage.setItem(STANDALONE_LS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function newStandaloneDiagnosisId(): string {
  return "diag_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * セルフ診断/再診断のドラフト保存(送信前の入力途中状態)
 * 1ブラウザ・1キーで管理(複数同時並行はサポートしない)
 */
const STANDALONE_DRAFT_LS_KEY = "qm-standalone-diagnose-draft";

export function loadStandaloneDraft<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STANDALONE_DRAFT_LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveStandaloneDraft<T>(draft: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STANDALONE_DRAFT_LS_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function clearStandaloneDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STANDALONE_DRAFT_LS_KEY);
}

const ONEONONE_LS_KEY = "qm-demo-one-on-ones";

function readExtraOneOnOnes(): OneOnOne[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ONEONONE_LS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OneOnOne[];
  } catch {
    return [];
  }
}

function writeExtraOneOnOnes(list: OneOnOne[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONEONONE_LS_KEY, JSON.stringify(list));
}

export function listOneOnOnesFor(employeeId: string): OneOnOne[] {
  const all = [...ONE_ON_ONES_SEED, ...readExtraOneOnOnes()];
  return all
    .filter((o) => o.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addOneOnOne(record: OneOnOne) {
  const extra = readExtraOneOnOnes();
  extra.push(record);
  writeExtraOneOnOnes(extra);
}

export function newOneOnOneId(): string {
  return "11_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
}
