"use client";

import { use, useEffect, useMemo, useState } from "react";
import { QUESTION_SECTIONS, EMOTION_QUESTIONS, FZ_QUESTIONS } from "@/lib/questions";
import { computeFullDiagnosis } from "@/lib/scoring";
import { getScoringRecord } from "@/data/scoring-db-v3";
import {
  loadSettings,
  newApplicantId,
  upsertApplicant,
} from "@/lib/store";
import { EMOTION_LABEL_JA } from "@/lib/types";
import type {
  EmotionScores,
  ResumeData,
  Settings,
  Applicant,
  OptionId,
  DiagnosticAnswers,
} from "@/lib/types";

type Step = "profile" | "career" | "diagnostic" | "emotions" | "done";

// ============================================================
// 自動保存(localStorage によるドラフト)
// 通信切断やページ離脱があっても、同じ応募URLに戻れば続きから再開できる
// ============================================================
const DRAFT_SCHEMA_VERSION = 1;

interface ApplyDraft {
  v: typeof DRAFT_SCHEMA_VERSION;
  applicantId: string;
  step: Step;
  diagSectionIdx: number;
  fullName: string;
  ageRange: string;
  gender: "男性" | "女性" | "その他";
  email: string;
  phone: string;
  appliedPosition: string;
  education: string;
  workHistory: string;
  selfPR: string;
  resumeData: ResumeData | null;
  resumeFileName: string | null;
  answers: DiagnosticAnswers;
  emotions: EmotionScores;
  updatedAt: string;
}

function draftKey(token: string) {
  return `qm-apply-draft-${token}`;
}

function loadDraft(token: string): ApplyDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(draftKey(token));
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as ApplyDraft;
    if (d.v !== DRAFT_SCHEMA_VERSION) return null;
    return d;
  } catch {
    return null;
  }
}

function saveDraft(token: string, d: ApplyDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(draftKey(token), JSON.stringify(d));
  } catch {
    // localStorage quota exceeded など、保存失敗時は黙って続行
  }
}

function clearDraft(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(token));
}

function formatSavedAt(d: Date): string {
  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);
  if (diffSec < 5) return "たった今";
  if (diffSec < 60) return `${diffSec}秒前`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function ApplyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  // 既存ドラフトがあれば全フィールドを復元
  const [initialDraft] = useState(() => loadDraft(token));
  const [draftRestored] = useState(() => initialDraft !== null);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [step, setStep] = useState<Step>(initialDraft?.step ?? "profile");
  const [diagSectionIdx, setDiagSectionIdx] = useState(initialDraft?.diagSectionIdx ?? 0);
  const [applicantId] = useState(() => initialDraft?.applicantId ?? newApplicantId());

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // ---- プロフィール ----
  const [fullName, setFullName] = useState(initialDraft?.fullName ?? "");
  const [ageRange, setAgeRange] = useState(initialDraft?.ageRange ?? "20代後半");
  const [gender, setGender] = useState<"男性" | "女性" | "その他">(
    initialDraft?.gender ?? "男性",
  );
  const [email, setEmail] = useState(initialDraft?.email ?? "");
  const [phone, setPhone] = useState(initialDraft?.phone ?? "");
  const [appliedPosition, setAppliedPosition] = useState(initialDraft?.appliedPosition ?? "");

  // ---- 経歴 ----
  const [education, setEducation] = useState(initialDraft?.education ?? "");
  const [workHistory, setWorkHistory] = useState(initialDraft?.workHistory ?? "");
  const [selfPR, setSelfPR] = useState(initialDraft?.selfPR ?? "");

  // ---- 履歴書アップロード ----
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(
    initialDraft?.resumeData ?? null,
  );
  const [resumeFileNameRestored] = useState(initialDraft?.resumeFileName ?? null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // ---- 診断回答(72問・強制選択式) ----
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

  // ---- 自動保存 ----
  const [savedAt, setSavedAt] = useState<Date | null>(
    initialDraft ? new Date(initialDraft.updatedAt) : null,
  );
  const [savedAtTick, setSavedAtTick] = useState(0); // 「N秒前」表示を更新するためのトリガー

  // フォーム状態が変わるたびに localStorage に保存(完了画面では保存しない)
  useEffect(() => {
    if (!settings) return; // 初期化前は保存しない
    if (step === "done") return; // 提出済みなら保存しない
    const draft: ApplyDraft = {
      v: DRAFT_SCHEMA_VERSION,
      applicantId,
      step,
      diagSectionIdx,
      fullName,
      ageRange,
      gender,
      email,
      phone,
      appliedPosition,
      education,
      workHistory,
      selfPR,
      resumeData,
      resumeFileName: resumeFile?.name ?? resumeFileNameRestored,
      answers,
      emotions,
      updatedAt: new Date().toISOString(),
    };
    saveDraft(token, draft);
    setSavedAt(new Date());
  }, [
    settings, step, diagSectionIdx,
    applicantId, fullName, ageRange, gender, email, phone, appliedPosition,
    education, workHistory, selfPR,
    resumeData, resumeFile, resumeFileNameRestored,
    answers, emotions,
    token,
  ]);

  // 「N秒前」表示を10秒ごとに更新
  useEffect(() => {
    const id = setInterval(() => setSavedAtTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  savedAtTick;

  // FZ分岐: 内的A高 × 表出A低 のときだけ表示
  // iA系の target_credit 平均が高く、eA系の target_credit 平均が低い場合
  const showFZ = useMemo(() => {
    const calcAvg = (prefix: string) => {
      const ids = ["iA-1","iA-2","iA-3","iA-4","iA-5","eA-1","eA-2","eA-3","eA-4","eA-5"]
        .filter((id) => id.startsWith(prefix));
      const values: number[] = [];
      for (const id of ids) {
        const opt = answers.aSeparation[id];
        if (!opt) continue;
        const rec = getScoringRecord(id, opt);
        if (rec) values.push(rec.target_credit);
      }
      if (values.length < ids.length) return null;
      return values.reduce((s, v) => s + v, 0) / values.length;
    };
    const iAAvg = calcAvg("iA");
    const eAAvg = calcAvg("eA");
    if (iAAvg === null || eAAvg === null) return false;
    return iAAvg >= 0.6 && eAAvg < 0.4;
  }, [answers.aSeparation]);

  const currentSection = QUESTION_SECTIONS[diagSectionIdx];
  const sectionQuestionsExtended = useMemo(() => {
    if (currentSection.id === "aSeparation" && showFZ) {
      return [...currentSection.questions, ...FZ_QUESTIONS];
    }
    return currentSection.questions;
  }, [currentSection, showFZ]);

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

  const sectionAnswered = sectionQuestionsExtended.every((q) => {
    return answers[currentSection.field][q.id] !== undefined;
  });

  const totalQuestions = QUESTION_SECTIONS.reduce((s, sec) => s + sec.questions.length, 0) + (showFZ ? 2 : 0);
  const answeredQuestions =
    Object.keys(answers.axis).length +
    Object.keys(answers.aSeparation).length +
    Object.keys(answers.integration).length +
    Object.keys(answers.responsibility).length +
    Object.keys(answers.orgRisk).length;

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
      if (data.fullName && !fullName) setFullName(data.fullName);
      if (data.email && !email) setEmail(data.email);
      if (data.phone && !phone) setPhone(data.phone);
    } catch (e) {
      setParseError((e as Error).message);
    } finally {
      setParsing(false);
    }
  }

  function setAnswer(field: keyof DiagnosticAnswers, qId: string, value: OptionId) {
    setAnswers((prev) => ({
      ...prev,
      [field]: { ...prev[field], [qId]: value },
    }));
  }

  function nextSection() {
    if (diagSectionIdx < QUESTION_SECTIONS.length - 1) {
      setDiagSectionIdx(diagSectionIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStep("emotions");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function prevSection() {
    if (diagSectionIdx > 0) {
      setDiagSectionIdx(diagSectionIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStep("career");
    }
  }

  function submit() {
    const result = computeFullDiagnosis(answers, emotions);
    const today = new Date().toISOString().slice(0, 10);
    const presetTendency =
      result.primaryType === "突破型"
        ? "A優位"
        : result.primaryType === "分析型" || result.primaryType === "設計型"
          ? "D優位"
          : result.primaryType === "共感型" || result.primaryType === "忠実型"
            ? "B優位"
            : result.primaryType === "統合型"
              ? "統合"
              : undefined;
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
      careerAnswers:
        useQuestions && (education || workHistory || selfPR)
          ? { education, workHistory, selfPR }
          : undefined,
      resume: useResume && resumeData ? resumeData : undefined,
      diagnoses: [
        {
          date: today,
          scenario: "応募時",
          answers,
          scores: result.scores,
          emotions,
          type: result.primaryType,
          result,
        },
      ],
      currentStage: "applied",
      interviews: [],
      presetTendency,
    };
    upsertApplicant(applicant);
    clearDraft(token);
    setStep("done");
  }

  function resetDraft() {
    if (!confirm("入力内容をすべて消去して最初からやり直しますか?この操作は取り消せません。")) return;
    clearDraft(token);
    // 強制リロードで全 state をリセット(useState 初期化が走り直す)
    window.location.reload();
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="border-b border-slate-200 pb-3">
        <div className="text-xs tracking-widest text-slate-500">応募フォーム · token: {token}</div>
        <h1 className="text-2xl font-bold">採用応募</h1>
        <p className="text-sm text-slate-600 mt-1">
          所要時間 約15-20分。プロフィール → 経歴 → 診断(72問・強制選択式・5セクション) で完了します。
        </p>
        <p className="text-xs text-emerald-700 mt-1 inline-flex items-center gap-1">
          <span>💾</span>
          <span>入力内容は自動でこのブラウザに保存されます。途中で離脱しても同じURLに戻れば続きから再開できます。</span>
        </p>
        {draftRestored && step !== "done" && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-sm flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-amber-900">📝 前回の入力を復元しました</div>
              <div className="text-xs text-amber-800 mt-0.5">
                {initialDraft && `最終保存: ${new Date(initialDraft.updatedAt).toLocaleString("ja-JP")}`}
                {resumeFileNameRestored && !resumeFile && (
                  <> · 履歴書ファイル「{resumeFileNameRestored}」は解析結果のみ保持(再アップロード不要)</>
                )}
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
              <span className="font-mono">{answeredQuestions} / {totalQuestions}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded">
              <div
                className="h-1.5 bg-brand-gradient rounded transition-all"
                style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}
        {savedAt && step !== "done" && (
          <div className="mt-2 text-[11px] text-slate-400 text-right">
            ✓ 自動保存済み({formatSavedAt(savedAt)})
          </div>
        )}
      </header>

      {step === "profile" && (
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
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
            <Field
              label="応募職種 *"
              value={appliedPosition}
              onChange={setAppliedPosition}
              placeholder="例: 営業職 / エンジニア"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep("career")}
              disabled={!profileValid()}
              className={
                "px-5 py-2 rounded font-semibold " +
                (profileValid()
                  ? "bg-brand-gradient text-white hover:shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed")
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
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
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
              {parsing && <div className="text-sm text-slate-500">AI解析中...</div>}
              {parseError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                  {parseError}
                </div>
              )}
              {resumeData && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm">
                  <div className="font-bold mb-1">
                    ✓ 解析完了: {resumeFile?.name ?? resumeFileNameRestored ?? "(前回アップロード分)"}
                  </div>
                  <div className="text-slate-700">
                    氏名: {resumeData.fullName ?? "—"} · 学歴: {resumeData.education?.length ?? 0}件 · 職歴:{" "}
                    {resumeData.workHistory?.length ?? 0}件
                  </div>
                  {!resumeFile && resumeFileNameRestored && (
                    <div className="text-xs text-emerald-700 mt-1">
                      ※ ファイル本体は再アップロード不要(解析結果が保持されています)。
                      変更したい場合は別のファイルを選び直してください。
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {useQuestions && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
              <h2 className="font-bold">経歴 · 質問形式入力</h2>
              <Textarea label="学歴" value={education} onChange={setEducation} />
              <Textarea label="職務経歴" value={workHistory} onChange={setWorkHistory} rows={5} />
              <Textarea label="自己PR" value={selfPR} onChange={setSelfPR} rows={4} />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep("profile")}
              className="px-4 py-2 rounded border border-slate-200 bg-white"
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                setStep("diagnostic");
                setDiagSectionIdx(0);
              }}
              disabled={!careerValid()}
              className={
                "px-5 py-2 rounded font-semibold " +
                (careerValid()
                  ? "bg-brand-gradient text-white hover:shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed")
              }
            >
              次へ →
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
              <p className="text-xs text-slate-500 mt-2">
                ※ 4つの選択肢から、いまの自分に最も近いものを1つだけ選んでください。「正解」はありません。
              </p>
            </div>
            <div className="space-y-5">
              {sectionQuestionsExtended.map((q) => {
                const field = q.category === "FZ" ? "aSeparation" : currentSection.field;
                const sel = answers[field][q.id];
                return (
                  <div key={q.id} className="border-t border-slate-100 pt-4">
                    <div className="text-sm font-medium mb-3 text-slate-800">
                      <span className="font-mono text-xs text-slate-400 mr-2">{q.id}</span>
                      {q.text}
                    </div>
                    <div className="grid gap-2">
                      {q.options.map((opt) => {
                        const isSelected = sel === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setAnswer(field, q.id, opt.id)}
                            className={
                              "text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-start gap-3 " +
                              (isSelected
                                ? "bg-brand-50 border-brand-500 text-slate-900 ring-2 ring-brand-200"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700")
                            }
                          >
                            <span
                              className={
                                "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 " +
                                (isSelected
                                  ? "bg-brand-500 text-white"
                                  : "bg-slate-100 text-slate-500")
                              }
                            >
                              {opt.id}
                            </span>
                            <span className="leading-relaxed">{opt.text}</span>
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
            <p className="text-sm text-slate-600">現在のあなたの状態を1〜5で評価してください。</p>
            {EMOTION_QUESTIONS.map((eq) => (
              <div key={eq.key} className="border-t border-slate-100 pt-3">
                <div className="text-sm font-medium mb-2">{EMOTION_LABEL_JA[eq.key]}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const sel = emotions[eq.key] === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setEmotions((p) => ({ ...p, [eq.key]: v }))}
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
              送信して応募完了
            </button>
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="bg-emerald-50 border-l-4 border-quad-c rounded p-6 space-y-3">
          <h2 className="text-xl font-bold">✓ 応募完了</h2>
          <p className="text-slate-700">
            ご応募ありがとうございました。担当者より追ってご連絡いたします。
          </p>
          <p className="text-xs text-slate-500">
            応募ID: {applicantId}(管理画面の応募ステージに反映されました)
          </p>
          <a
            href="/admin/recruit"
            className="inline-block bg-brand-gradient text-white text-sm font-semibold px-3 py-2 rounded"
          >
            (デモ用) 管理画面で確認 →
          </a>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ["profile", "career", "diagnostic", "emotions", "done"];
  const idx = order.indexOf(step);
  const labels: Record<Step, string> = {
    profile: "プロフィール",
    career: "経歴",
    diagnostic: "診断",
    emotions: "感情",
    done: "完了",
  };
  return (
    <div className="flex items-center gap-1.5 mt-3 text-xs flex-wrap">
      {order.slice(0, 4).map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <span
            className={
              "inline-flex items-center justify-center w-6 h-6 rounded-full font-mono " +
              (i <= idx ? "bg-brand-gradient text-white" : "bg-slate-200 text-slate-500")
            }
          >
            {i + 1}
          </span>
          <span className={i <= idx ? "text-slate-800 font-bold" : "text-slate-400"}>
            {labels[s]}
          </span>
          {i < 3 && <span className="mx-0.5 text-slate-300">→</span>}
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
      <div className="text-xs tracking-widest text-slate-500 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
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
