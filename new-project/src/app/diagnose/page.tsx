"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS, EMOTION_QUESTIONS } from "@/lib/questions";
import { findCandidate } from "@/data/candidates";
import { computeAxisScores, judgeType } from "@/lib/scoring";
import { saveSession } from "@/lib/store";
import { EMOTION_LABEL_JA } from "@/lib/types";
import type { AxisKey, EmotionScores } from "@/lib/types";

function DiagnoseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const candidateId = params.get("candidateId") ?? "";
  const scenario =
    (params.get("scenario") as "採用時" | "1年後") ?? "採用時";

  const candidate = useMemo(() => findCandidate(candidateId), [candidateId]);

  const preset = useMemo(() => {
    if (!candidate) return null;
    return candidate.diagnoses.find((d) => d.scenario === scenario) ?? null;
  }, [candidate, scenario]);

  const [answers, setAnswers] = useState<(AxisKey | null)[]>(
    () => preset?.answers?.map((a) => a as AxisKey) ?? Array(QUESTIONS.length).fill(null),
  );
  const [emotions, setEmotions] = useState<EmotionScores>(
    () => preset?.emotions ?? { fear: 3, sadness: 3, anger: 3, joy: 3, happiness: 3 },
  );

  const allAnswered = answers.every((a) => a !== null);

  if (!candidate) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        候補者が見つかりません。
        <button
          className="ml-2 underline"
          onClick={() => router.push("/")}
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  function setAnswer(idx: number, axis: AxisKey) {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = axis;
      return next;
    });
  }

  function setEmotion(key: keyof EmotionScores, val: number) {
    setEmotions((prev) => ({ ...prev, [key]: val }));
  }

  function onSubmit() {
    if (!allAnswered) return;
    const finalAnswers = answers as AxisKey[];
    const scores = computeAxisScores(finalAnswers);
    const type = judgeType(scores);
    saveSession({
      candidateId,
      scenario,
      answers: finalAnswers,
      scores,
      emotions,
      type,
    });
    router.push(`/result?candidateId=${candidateId}&scenario=${scenario}`);
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-quad-line pb-4">
        <div className="text-xs tracking-widest text-gray-500">SCREEN 2 / 5</div>
        <h1 className="text-2xl font-bold">診断 ── {candidate.name}</h1>
        <div className="text-sm text-gray-600 mt-1">
          シナリオ: <span className="font-semibold">{scenario}</span> · 応募職種: {candidate.appliedPosition}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          ※ プリセット回答が初期表示されています。回答を変更してから「結果を見る」を押せばその通りに反映されます。
        </div>
      </header>

      <section>
        <h2 className="text-lg font-bold mb-4">Q1〜Q9 ── 行動傾向の把握</h2>
        <div className="space-y-5">
          {QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-quad-line rounded p-4"
            >
              <div className="flex items-baseline mb-3">
                <span className="text-xs font-mono text-gray-400 w-10">{q.id}</span>
                <span className="font-medium">{q.text}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[idx] === opt.axis;
                  return (
                    <button
                      key={oi}
                      onClick={() => setAnswer(idx, opt.axis)}
                      className={
                        "text-left text-sm px-3 py-2 rounded border transition-colors " +
                        (selected
                          ? "bg-quad-d/10 border-quad-d ring-1 ring-quad-d"
                          : "bg-white border-quad-line hover:bg-gray-50")
                      }
                    >
                      <span className="text-xs font-mono text-gray-400 mr-2">{opt.axis}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">5感情の自己評価(各 1〜5)</h2>
        <div className="bg-white border border-quad-line rounded p-4 space-y-4">
          {EMOTION_QUESTIONS.map((eq) => (
            <div key={eq.key}>
              <div className="text-sm font-medium mb-2">
                {EMOTION_LABEL_JA[eq.key]} ── {eq.text}
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => {
                  const sel = emotions[eq.key] === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setEmotion(eq.key, v)}
                      className={
                        "w-10 h-10 rounded font-mono text-sm border transition-colors " +
                        (sel
                          ? "bg-quad-b text-white border-quad-b"
                          : "bg-white border-quad-line hover:bg-gray-50")
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
      </section>

      <div className="flex gap-3 sticky bottom-4">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded border border-quad-line bg-white text-gray-700 hover:bg-gray-50"
        >
          戻る
        </button>
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={
            "flex-1 px-4 py-3 rounded font-semibold transition-colors " +
            (allAnswered
              ? "bg-quad-d text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed")
          }
        >
          {allAnswered ? "結果を見る" : `回答を完了してください (${answers.filter(Boolean).length}/${QUESTIONS.length})`}
        </button>
      </div>
    </div>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <DiagnoseInner />
    </Suspense>
  );
}
