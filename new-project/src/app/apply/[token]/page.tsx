"use client";

import { use, useEffect, useMemo, useState } from "react";
import { QUESTIONS, EMOTION_QUESTIONS } from "@/lib/questions";
import { computeAxisScores, judgeType } from "@/lib/scoring";
import {
  loadSettings,
  newApplicantId,
  upsertApplicant,
} from "@/lib/store";
import {
  EMOTION_LABEL_JA,
} from "@/lib/types";
import type {
  AxisKey,
  EmotionScores,
  ResumeData,
  Settings,
  Applicant,
} from "@/lib/types";

type Step = "profile" | "career" | "diagnosis" | "review" | "done";

export default function ApplyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [step, setStep] = useState<Step>("profile");
  const [applicantId] = useState(() => newApplicantId());

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // ---- プロフィール ----
  const [fullName, setFullName] = useState("");
  const [ageRange, setAgeRange] = useState("20代後半");
  const [gender, setGender] = useState<"男性" | "女性" | "その他">("男性");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [appliedPosition, setAppliedPosition] = useState("");

  // ---- 経歴 (質問形式) ----
  const [education, setEducation] = useState("");
  const [workHistory, setWorkHistory] = useState("");
  const [selfPR, setSelfPR] = useState("");

  // ---- 履歴書アップロード ----
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // ---- 診断 ----
  const [answers, setAnswers] = useState<(AxisKey | null)[]>(
    Array(QUESTIONS.length).fill(null),
  );
  const [emotions, setEmotions] = useState<EmotionScores>({
    fear: 3,
    sadness: 3,
    anger: 3,
    joy: 3,
    happiness: 3,
  });

  if (!settings) return <div>読み込み中...</div>;

  const useQuestions = settings.inputMode === "questions" || settings.inputMode === "both";
  const useResume = settings.inputMode === "resume" || settings.inputMode === "both";

  function profileValid() {
    return fullName && appliedPosition;
  }
  function careerValid() {
    if (settings && settings.inputMode === "questions") return education && workHistory && selfPR;
    if (settings && settings.inputMode === "resume") return !!resumeData;
    if (settings && settings.inputMode === "both") return (education && workHistory) || resumeData;
    return false;
  }

  async function uploadResume(file: File) {
    setParsing(true);
    setParseError(null);
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64,
          mediaType: file.type || "application/pdf",
          fileName: file.name,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setParseError(err.error || `エラー (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setParseError(data.error);
        return;
      }
      setResumeData(data as ResumeData);
      // 自動で profile に反映
      if (data.fullName && !fullName) setFullName(data.fullName);
      if (data.email && !email) setEmail(data.email);
      if (data.phone && !phone) setPhone(data.phone);
    } catch (e) {
      setParseError((e as Error).message);
    } finally {
      setParsing(false);
    }
  }

  function setAnswer(idx: number, axis: AxisKey) {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = axis;
      return next;
    });
  }

  const allAnswered = answers.every((a) => a !== null);

  function submit() {
    if (!allAnswered) return;
    const finalAnswers = answers as AxisKey[];
    const scores = computeAxisScores(finalAnswers);
    const type = judgeType(scores);
    const today = new Date().toISOString().slice(0, 10);
    const applicant: Applicant = {
      id: applicantId,
      profile: {
        fullName,
        ageRange,
        gender,
        email,
        phone,
        appliedPosition,
        appliedDate: today,
      },
      careerAnswers: useQuestions && (education || workHistory || selfPR)
        ? { education, workHistory, selfPR }
        : undefined,
      resume: useResume && resumeData ? resumeData : undefined,
      diagnoses: [
        {
          date: today,
          scenario: "応募時",
          answers: finalAnswers,
          scores,
          emotions,
          type,
        },
      ],
      currentStage: "applied",
      interviews: [],
      presetTendency:
        type === "ワガママ型" ? "A優位"
        : type === "理詰め型" ? "D優位"
        : type === "承認欲求型" ? "B優位"
        : type === "統合型" ? "統合"
        : undefined,
    };
    upsertApplicant(applicant);
    setStep("done");
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="border-b border-quad-line pb-3">
        <div className="text-xs tracking-widest text-gray-500">応募フォーム · token: {token}</div>
        <h1 className="text-2xl font-bold">採用応募</h1>
        <p className="text-sm text-gray-600 mt-1">
          所要時間 約10分。プロフィール → 経歴 → 診断 の3ステップで完了します。
        </p>
        <StepIndicator step={step} />
      </header>

      {step === "profile" && (
        <section className="bg-white border border-quad-line rounded-lg p-6 space-y-4">
          <h2 className="font-bold">Step 1 · プロフィール</h2>
          <div className="grid gap-3">
            <Field label="氏名 *" value={fullName} onChange={setFullName} />
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
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="メール" value={email} onChange={setEmail} type="email" />
              <Field label="電話番号" value={phone} onChange={setPhone} />
            </div>
            <Field label="応募職種 *" value={appliedPosition} onChange={setAppliedPosition} placeholder="例: 営業職 / エンジニア" />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep("career")}
              disabled={!profileValid()}
              className={
                "px-5 py-2 rounded font-semibold " +
                (profileValid()
                  ? "bg-quad-d text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed")
              }
            >
              次へ →
            </button>
          </div>
        </section>
      )}

      {step === "career" && (
        <section className="space-y-4">
          {useResume && (
            <div className="bg-white border border-quad-line rounded-lg p-6 space-y-3">
              <h2 className="font-bold">経歴 · 履歴書アップロード(PDF / 画像)</h2>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setResumeFile(f);
                    uploadResume(f);
                  }
                }}
                className="block text-sm"
              />
              {parsing && <div className="text-sm text-gray-500">AI解析中...</div>}
              {parseError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">{parseError}</div>
              )}
              {resumeData && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm">
                  <div className="font-bold mb-1">✓ 解析完了: {resumeFile?.name}</div>
                  <div className="text-gray-700">
                    氏名: {resumeData.fullName ?? "—"} · メール: {resumeData.email ?? "—"} · 学歴: {resumeData.education?.length ?? 0}件 · 職歴: {resumeData.workHistory?.length ?? 0}件
                  </div>
                </div>
              )}
            </div>
          )}

          {useQuestions && (
            <div className="bg-white border border-quad-line rounded-lg p-6 space-y-3">
              <h2 className="font-bold">経歴 · 質問形式入力</h2>
              <Textarea label="学歴" value={education} onChange={setEducation} placeholder="例: ○○大学 ○○学部 卒業 (2020年3月)" />
              <Textarea label="職務経歴" value={workHistory} onChange={setWorkHistory} placeholder="主な経歴を簡潔に" rows={5} />
              <Textarea label="自己PR" value={selfPR} onChange={setSelfPR} placeholder="強みや志望動機など" rows={4} />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep("profile")}
              className="px-4 py-2 rounded border border-quad-line bg-white"
            >
              ← 戻る
            </button>
            <button
              onClick={() => setStep("diagnosis")}
              disabled={!careerValid()}
              className={
                "px-5 py-2 rounded font-semibold " +
                (careerValid()
                  ? "bg-quad-d text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed")
              }
            >
              次へ →
            </button>
          </div>
        </section>
      )}

      {step === "diagnosis" && (
        <section className="space-y-4">
          <div className="bg-white border border-quad-line rounded-lg p-6 space-y-4">
            <h2 className="font-bold">Step 3 · 診断 (Q1〜Q9)</h2>
            <p className="text-sm text-gray-600">
              直感で答えてください。正解はありません。あなたの「動き方のパターン」を見るための質問です。
            </p>
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="border-t border-quad-line pt-3">
                <div className="text-sm font-medium mb-2">
                  <span className="font-mono text-gray-400 mr-2">{q.id}</span>
                  {q.text}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const sel = answers[idx] === opt.axis;
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswer(idx, opt.axis)}
                        className={
                          "text-left text-sm px-3 py-2 rounded border transition-colors " +
                          (sel
                            ? "bg-quad-d/10 border-quad-d ring-1 ring-quad-d"
                            : "bg-white border-quad-line hover:bg-gray-50")
                        }
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-quad-line rounded-lg p-6 space-y-3">
            <h3 className="font-bold">5感情の自己評価(各 1〜5)</h3>
            {EMOTION_QUESTIONS.map((eq) => (
              <div key={eq.key}>
                <div className="text-sm font-medium mb-2">{EMOTION_LABEL_JA[eq.key]}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const sel = emotions[eq.key] === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setEmotions((p) => ({ ...p, [eq.key]: v }))}
                        className={
                          "w-10 h-10 rounded font-mono text-sm border " +
                          (sel ? "bg-quad-b text-white border-quad-b" : "bg-white border-quad-line hover:bg-gray-50")
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
              onClick={() => setStep("career")}
              className="px-4 py-2 rounded border border-quad-line bg-white"
            >
              ← 戻る
            </button>
            <button
              onClick={submit}
              disabled={!allAnswered}
              className={
                "px-5 py-2 rounded font-semibold " +
                (allAnswered
                  ? "bg-quad-c text-white hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed")
              }
            >
              送信して応募完了({answers.filter(Boolean).length}/{QUESTIONS.length})
            </button>
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="bg-emerald-50 border-l-4 border-quad-c rounded p-6 space-y-3">
          <h2 className="text-xl font-bold">✓ 応募完了</h2>
          <p className="text-gray-700">
            ご応募ありがとうございました。担当者より追ってご連絡いたします。
          </p>
          <p className="text-xs text-gray-500">
            応募ID: {applicantId}(管理画面の応募ステージに反映されました)
          </p>
          <a
            href="/admin/recruit"
            className="inline-block bg-quad-d text-white text-sm font-semibold px-3 py-2 rounded"
          >
            (デモ用) 管理画面で確認 →
          </a>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ["profile", "career", "diagnosis", "done"];
  const idx = order.indexOf(step);
  const labels: Record<Step, string> = {
    profile: "プロフィール",
    career: "経歴",
    diagnosis: "診断",
    review: "確認",
    done: "完了",
  };
  return (
    <div className="flex items-center gap-2 mt-3 text-xs">
      {order.slice(0, 3).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={
              "inline-flex items-center justify-center w-6 h-6 rounded-full font-mono " +
              (i <= idx ? "bg-quad-d text-white" : "bg-gray-200 text-gray-500")
            }
          >
            {i + 1}
          </span>
          <span className={i <= idx ? "text-gray-800 font-bold" : "text-gray-400"}>
            {labels[s]}
          </span>
          {i < 2 && <span className="mx-1 text-gray-300">→</span>}
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
      <div className="text-xs tracking-widest text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-quad-line rounded px-3 py-2 text-sm"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-xs tracking-widest text-gray-500 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-quad-line rounded px-3 py-2 text-sm"
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
      <div className="text-xs tracking-widest text-gray-500 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-quad-line rounded px-3 py-2 text-sm bg-white"
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
