"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QUESTION_SECTIONS, EMOTION_QUESTIONS, FZ_QUESTIONS } from "@/lib/questions";
import { computeFullDiagnosis } from "@/lib/scoring";
import { EMOTION_LABEL_JA } from "@/lib/types";
import type { EmotionScores, LikertValue, DiagnosticAnswers, Diagnosis, StandaloneDiagnosis } from "@/lib/types";
import {
  newStandaloneDiagnosisId,
  upsertStandaloneDiagnosis,
  loadStandaloneDraft,
  saveStandaloneDraft,
  clearStandaloneDraft,
  findEmployeeMerged,
  upsertEmployee,
} from "@/lib/store";

type Step = "profile" | "diagnostic" | "emotions";

const LIKERT_LABELS: Record<LikertValue, string> = {
  1: "全くあてはまらない",
  2: "あまりあてはまらない",
  3: "どちらでもない",
  4: "ややあてはまる",
  5: "とてもあてはまる",
};

interface DiagnoseDraft {
  v: 1;
  diagnosisId: string;
  step: Step;
  diagSectionIdx: number;
  fullName: string;
  ageRange: string;
  gender: "男性" | "女性" | "その他";
  email: string;
  optionalContext: string;
  answers: DiagnosticAnswers;
  emotions: EmotionScores;
  responseTimings: Record<string, number>;
  previousId?: string;
  updatedAt: string;
}

function formatSavedAt(d: Date): string {
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 5) return "たった今";
  if (diffSec < 60) return `${diffSec}秒前`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function DiagnoseStandalonePage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-12 text-center text-slate-500">読み込み中...</div>}>
      <DiagnoseStandaloneInner />
    </Suspense>
  );
}

function DiagnoseStandaloneInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previousId = searchParams.get("previousId") ?? undefined;
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const scenarioParam = searchParams.get("scenario") ?? undefined;

  // employeeId が指定されている場合、社員プロフィールでプリフィルする
  const linkedEmployee = useMemo(() => {
    if (!employeeId) return null;
    if (typeof window === "undefined") return null;
    return findEmployeeMerged(employeeId) ?? null;
  }, [employeeId]);

  const [initialDraft] = useState<DiagnoseDraft | null>(() => loadStandaloneDraft<DiagnoseDraft>());
  const [draftRestored] = useState(() => initialDraft !== null);
  const [diagnosisId] = useState(() => initialDraft?.diagnosisId ?? newStandaloneDiagnosisId());

  const [step, setStep] = useState<Step>(initialDraft?.step ?? "profile");
  const [diagSectionIdx, setDiagSectionIdx] = useState(initialDraft?.diagSectionIdx ?? 0);

  const [fullName, setFullName] = useState(initialDraft?.fullName ?? linkedEmployee?.fullName ?? "");
  const [ageRange, setAgeRange] = useState(initialDraft?.ageRange ?? linkedEmployee?.ageRange ?? "20代後半");
  const [gender, setGender] = useState<"男性" | "女性" | "その他">(
    initialDraft?.gender ?? linkedEmployee?.gender ?? "男性",
  );
  const [email, setEmail] = useState(initialDraft?.email ?? "");
  const [optionalContext, setOptionalContext] = useState(
    initialDraft?.optionalContext ?? (linkedEmployee?.currentRole ? `現職: ${linkedEmployee.currentRole}` : ""),
  );

  const [answers, setAnswers] = useState<DiagnosticAnswers>(
    initialDraft?.answers ?? {
      axis: {},
      aSeparation: {},
      integration: {},
      responsibility: {},
      orgRisk: {},
    },
  );
  const [emotions, setEmotions] = useState<EmotionScores>(
    initialDraft?.emotions ?? {
      fear: 3,
      sadness: 3,
      anger: 3,
      joy: 3,
      happiness: 3,
    },
  );

  // 回答時間ロギング
  const [responseTimings, setResponseTimings] = useState<Record<string, number>>(
    initialDraft?.responseTimings ?? {},
  );
  const lastClickTimeRef = useRef<number | null>(null);
  const sectionEntryTimeRef = useRef<number>(Date.now());

  const [savedAt, setSavedAt] = useState<Date | null>(
    initialDraft ? new Date(initialDraft.updatedAt) : null,
  );
  const [, setSavedAtTick] = useState(0);

  // FZ 分岐
  const showFZ = useMemo(() => {
    const iAValues = ["iA-1", "iA-2", "iA-3", "iA-4", "iA-5"].map((id) => answers.aSeparation[id]).filter(Boolean) as LikertValue[];
    const eAValues = ["eA-1", "eA-2", "eA-3", "eA-4", "eA-5"].map((id) => answers.aSeparation[id]).filter(Boolean) as LikertValue[];
    if (iAValues.length < 5 || eAValues.length < 5) return false;
    const iAAvg = iAValues.reduce((s, v) => s + v, 0) / iAValues.length;
    const eA5Reversed = 6 - (answers.aSeparation["eA-5"] ?? 3);
    const eAValuesAdj = eAValues.map((v, i) => (i === 4 ? eA5Reversed : v));
    const eAAvg = eAValuesAdj.reduce((s, v) => s + v, 0) / eAValuesAdj.length;
    return iAAvg >= 3.5 && eAAvg < 3.0;
  }, [answers.aSeparation]);

  const currentSection = QUESTION_SECTIONS[diagSectionIdx];
  const sectionQuestionsExtended = useMemo(() => {
    if (currentSection.id === "aSeparation" && showFZ) {
      return [...currentSection.questions, ...FZ_QUESTIONS];
    }
    return currentSection.questions;
  }, [currentSection, showFZ]);

  const sectionAnswered = sectionQuestionsExtended.every((q) => answers[currentSection.field][q.id] !== undefined);

  const totalQuestions = QUESTION_SECTIONS.reduce((s, sec) => s + sec.questions.length, 0) + (showFZ ? 2 : 0);
  const answeredQuestions =
    Object.keys(answers.axis).length +
    Object.keys(answers.aSeparation).length +
    Object.keys(answers.integration).length +
    Object.keys(answers.responsibility).length +
    Object.keys(answers.orgRisk).length;

  // 自動保存
  useEffect(() => {
    const draft: DiagnoseDraft = {
      v: 1,
      diagnosisId,
      step,
      diagSectionIdx,
      fullName,
      ageRange,
      gender,
      email,
      optionalContext,
      answers,
      emotions,
      responseTimings,
      previousId,
      updatedAt: new Date().toISOString(),
    };
    saveStandaloneDraft(draft);
    setSavedAt(new Date());
  }, [diagnosisId, step, diagSectionIdx, fullName, ageRange, gender, email, optionalContext, answers, emotions, responseTimings, previousId]);

  useEffect(() => {
    const id = setInterval(() => setSavedAtTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  function profileValid() {
    return fullName.trim().length > 0;
  }

  function setAnswer(field: keyof DiagnosticAnswers, qId: string, value: LikertValue) {
    const now = Date.now();
    setResponseTimings((prev) => {
      if (prev[qId] !== undefined) return prev;
      const baseline = lastClickTimeRef.current ?? sectionEntryTimeRef.current;
      const elapsed = Math.min(Math.max(now - baseline, 0), 60_000);
      return { ...prev, [qId]: elapsed };
    });
    lastClickTimeRef.current = now;
    setAnswers((prev) => ({
      ...prev,
      [field]: { ...prev[field], [qId]: value },
    }));
  }

  function nextSection() {
    sectionEntryTimeRef.current = Date.now();
    lastClickTimeRef.current = null;
    if (diagSectionIdx < QUESTION_SECTIONS.length - 1) {
      setDiagSectionIdx(diagSectionIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStep("emotions");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function prevSection() {
    sectionEntryTimeRef.current = Date.now();
    lastClickTimeRef.current = null;
    if (diagSectionIdx > 0) {
      setDiagSectionIdx(diagSectionIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStep("profile");
    }
  }

  function submit() {
    const result = computeFullDiagnosis(answers, emotions, responseTimings);
    const today = new Date().toISOString().slice(0, 10);

    // 常にスタンドアロン診断として保存(共有可能な結果ページ用)
    const diagnosis: StandaloneDiagnosis = {
      id: diagnosisId,
      date: today,
      profile: {
        fullName: fullName.trim(),
        ageRange,
        gender,
        email: email.trim() || undefined,
        optionalContext: optionalContext.trim() || undefined,
      },
      scores: result.scores,
      emotions,
      type: result.primaryType,
      result,
      previousId,
    };
    upsertStandaloneDiagnosis(diagnosis);

    // employeeId が指定されている場合、社員レコードにも追加
    if (employeeId) {
      const employee = findEmployeeMerged(employeeId);
      if (employee) {
        const allowedScenarios = ["応募時", "採用時", "1年後", "再診断"] as const;
        type ScenarioType = (typeof allowedScenarios)[number];
        const scenario: ScenarioType = allowedScenarios.includes(scenarioParam as ScenarioType)
          ? (scenarioParam as ScenarioType)
          : "再診断";
        const newEmployeeDiagnosis: Diagnosis = {
          date: today,
          scenario,
          questionSetVersion: "v1.0",
          answers,
          scores: result.scores,
          emotions,
          type: result.primaryType,
          result,
        };
        upsertEmployee({
          ...employee,
          diagnoses: [...employee.diagnoses, newEmployeeDiagnosis],
        });
        clearStandaloneDraft();
        router.push(`/admin/manage/${employeeId}?fromDiagnose=${diagnosisId}`);
        return;
      }
    }

    clearStandaloneDraft();
    router.push(`/diagnose/result/${diagnosisId}`);
  }

  function resetDraft() {
    if (!confirm("入力内容をすべて消去して最初からやり直しますか?")) return;
    clearStandaloneDraft();
    window.location.reload();
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="border-b border-slate-200 pb-3">
        <div className="text-xs tracking-widest text-slate-500">
          {linkedEmployee ? "QUAD MIND DIAGNOSE · 社員診断" : "QUAD MIND DIAGNOSE · セルフ診断"}
        </div>
        <h1 className="text-2xl font-bold">
          {linkedEmployee ? `${linkedEmployee.fullName} さんの ${scenarioParam ?? "再"}診断` : "セルフ診断"}
        </h1>
        {linkedEmployee && (
          <p className="text-xs text-emerald-700 mt-1">
            🔗 社員レコード「{linkedEmployee.fullName}」に紐付いた診断です。送信後この社員の診断履歴に追加されます。
          </p>
        )}
        <p className="text-sm text-slate-600 mt-1">
          所要時間 約15-20分。プロフィール → 75問(5セクション)→ 5感情 で完了します。
          {!linkedEmployee && (
            <>
              <br />
              応募や採用とは独立しており、自分の状態を把握する目的で何度でも受け直し可能です。
            </>
          )}
        </p>
        <p className="text-xs text-emerald-700 mt-1 inline-flex items-center gap-1">
          <span>💾</span>
          <span>入力内容は自動でこのブラウザに保存されます。離脱しても続きから再開できます。</span>
        </p>
        {draftRestored && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-sm flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-amber-900">📝 前回の入力を復元しました</div>
              <div className="text-xs text-amber-800 mt-0.5">
                {initialDraft && `最終保存: ${new Date(initialDraft.updatedAt).toLocaleString("ja-JP")}`}
              </div>
            </div>
            <button
              onClick={resetDraft}
              className="text-xs px-3 py-1.5 rounded border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 shrink-0"
            >
              最初からやり直す
            </button>
          </div>
        )}
        <StepIndicator step={step} />
        {step === "diagnostic" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>進捗</span>
              <span className="font-mono">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded">
              <div
                className="h-1.5 bg-brand-gradient rounded transition-all"
                style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}
        {savedAt && (
          <div className="mt-2 text-[11px] text-slate-400 text-right">
            ✓ 自動保存済み({formatSavedAt(savedAt)})
          </div>
        )}
      </header>

      {step === "profile" && (
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="font-bold">Step 1 · プロフィール</h2>
          <Field label="氏名(ニックネーム可) *" value={fullName} onChange={setFullName} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="年代 *"
              value={ageRange}
              onChange={setAgeRange}
              options={["20代前半", "20代後半", "30代前半", "30代後半", "40代", "50代以上"]}
            />
            <SelectField
              label="性別 *"
              value={gender}
              onChange={(v) => setGender(v as typeof gender)}
              options={["男性", "女性", "その他"]}
            />
          </div>
          <Field label="メール(任意・1年後再診断時の通知用)" value={email} onChange={setEmail} type="email" />
          <Field
            label="文脈情報(任意・職種/業種/状況など。AI個別分析で参照されます)"
            value={optionalContext}
            onChange={setOptionalContext}
            placeholder="例: 営業職5年目、最近マネジメントに移行"
          />
          <div className="flex justify-between">
            <Link href="/" className="text-sm text-slate-500 hover:underline">
              ← トップへ
            </Link>
            <button
              onClick={() => setStep("diagnostic")}
              disabled={!profileValid()}
              className={
                "px-5 py-2 rounded font-semibold " +
                (profileValid()
                  ? "bg-brand-gradient text-white hover:shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed")
              }
            >
              診断開始 →
            </button>
          </div>
        </section>
      )}

      {step === "diagnostic" && (
        <section className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">
                {diagSectionIdx + 1} / {QUESTION_SECTIONS.length}
              </div>
              <h2 className="font-bold text-lg">{currentSection.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{currentSection.description}</p>
            </div>
            <div className="space-y-4">
              {sectionQuestionsExtended.map((q) => {
                const field = q.category === "FZ" ? "aSeparation" : currentSection.field;
                const sel = answers[field][q.id];
                return (
                  <div key={q.id} className="border-t border-slate-100 pt-3">
                    <div className="text-sm font-medium mb-2 text-slate-800">
                      <span className="font-mono text-xs text-slate-400 mr-2">{q.id}</span>
                      {q.text}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {([1, 2, 3, 4, 5] as LikertValue[]).map((v) => {
                        const isSelected = sel === v;
                        return (
                          <button
                            key={v}
                            onClick={() => setAnswer(field, q.id, v)}
                            className={
                              "px-2 py-2 rounded-lg border text-xs transition-colors " +
                              (isSelected
                                ? "bg-brand-500 text-white border-brand-500"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600")
                            }
                          >
                            <div className="font-bold mb-0.5">{v}</div>
                            <div className="text-[10px] leading-tight">{LIKERT_LABELS[v]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between gap-3 sticky bottom-2 z-10">
            <button
              onClick={prevSection}
              className="px-4 py-2 rounded border border-slate-200 bg-white shadow-sm"
            >
              ← 前へ
            </button>
            <button
              onClick={nextSection}
              disabled={!sectionAnswered}
              className={
                "flex-1 px-5 py-3 rounded font-semibold shadow-sm " +
                (sectionAnswered
                  ? "bg-brand-gradient text-white hover:shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed")
              }
            >
              {diagSectionIdx < QUESTION_SECTIONS.length - 1
                ? `次のセクション(${diagSectionIdx + 2} / ${QUESTION_SECTIONS.length}) →`
                : "5感情の評価へ →"}
            </button>
          </div>
        </section>
      )}

      {step === "emotions" && (
        <section className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
            <h2 className="font-bold">最終ステップ · 5感情の自己評価</h2>
            <p className="text-sm text-slate-600">現在のあなたの状態を 1〜5 で評価してください。</p>
            {EMOTION_QUESTIONS.map((eq) => (
              <div key={eq.key} className="border-t border-slate-100 pt-3">
                <div className="text-sm font-medium mb-2">{EMOTION_LABEL_JA[eq.key]}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const sel = emotions[eq.key] === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setEmotions((p) => ({ ...p, [eq.key]: v as LikertValue }))}
                        className={
                          "w-12 h-12 rounded-lg font-mono text-sm border " +
                          (sel
                            ? "bg-quad-b text-white border-quad-b"
                            : "bg-white border-slate-200 hover:bg-slate-50")
                        }
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => {
                setStep("diagnostic");
                setDiagSectionIdx(QUESTION_SECTIONS.length - 1);
              }}
              className="px-4 py-2 rounded border border-slate-200 bg-white"
            >
              ← 戻る
            </button>
            <button
              onClick={submit}
              className="px-5 py-2 rounded font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              結果を見る →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ["profile", "diagnostic", "emotions"];
  const idx = order.indexOf(step);
  const labels: Record<Step, string> = {
    profile: "プロフィール",
    diagnostic: "診断",
    emotions: "感情",
  };
  return (
    <div className="flex items-center gap-1.5 mt-3 text-xs flex-wrap">
      {order.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <span
            className={
              "inline-flex items-center justify-center w-6 h-6 rounded-full font-mono " +
              (i <= idx ? "bg-brand-gradient text-white" : "bg-slate-200 text-slate-500")
            }
          >
            {i + 1}
          </span>
          <span className={i <= idx ? "text-slate-800 font-bold" : "text-slate-400"}>{labels[s]}</span>
          {i < order.length - 1 && <span className="mx-0.5 text-slate-300">→</span>}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs tracking-widest text-slate-500 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <div className="text-xs tracking-widest text-slate-500 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
