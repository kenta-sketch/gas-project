"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { findCandidate } from "@/data/candidates";
import { QuadRadar } from "@/components/RadarChart";
import { ScoreTable } from "@/components/ScoreTable";
import type { AxisKey } from "@/lib/types";

function CompareInner() {
  const params = useSearchParams();
  const router = useRouter();
  const candidateId = params.get("candidateId") ?? "";
  const candidate = findCandidate(candidateId);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (!candidate) return;
    if (requested.current) return;
    const t1 = candidate.diagnoses.find((d) => d.scenario === "採用時");
    const t2 = candidate.diagnoses.find((d) => d.scenario === "1年後");
    if (!t1 || !t2) {
      setError("採用時または1年後のデータが不足しています");
      return;
    }
    requested.current = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: candidate.name,
            ageRange: candidate.ageRange,
            gender: candidate.gender,
            roleAtHire: candidate.appliedPosition,
            currentRole: candidate.appliedPosition + "(入社後1年経過)",
            scoresT1: t1.scores,
            scoresT2: t2.scores,
            typeT1: t1.type,
            typeT2: t2.type,
            dateT1: t1.date,
            dateT2: t2.date,
          }),
        });
        if (!res.ok) {
          setError(`APIエラー (${res.status}): ${(await res.text()).slice(0, 200)}`);
          return;
        }
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let acc = "";
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setText(acc);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [candidate]);

  if (!candidate) return <div>候補者が見つかりません。</div>;
  const t1 = candidate.diagnoses.find((d) => d.scenario === "採用時");
  const t2 = candidate.diagnoses.find((d) => d.scenario === "1年後");
  if (!t1 || !t2) return <div>採用時または1年後のデータがありません。</div>;

  const delta: Record<AxisKey, number> = {
    A: t2.scores.A - t1.scores.A,
    B: t2.scores.B - t1.scores.B,
    C: t2.scores.C - t1.scores.C,
    D: t2.scores.D - t1.scores.D,
  };
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

  return (
    <div className="space-y-8">
      <header className="border-b border-quad-line pb-4">
        <div className="text-xs tracking-widest text-gray-500">SCREEN 5 / 5</div>
        <h1 className="text-2xl font-bold">1年後の変化 ── {candidate.name}</h1>
        <div className="text-sm text-gray-600 mt-1">
          採用時 ({t1.date}) → 1年後 ({t2.date})
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-quad-line rounded p-5">
          <h2 className="text-sm font-bold text-gray-500 tracking-widest mb-3">
            QUAD MIND RADAR (重ね合わせ)
          </h2>
          <QuadRadar
            scores={t1.scores}
            comparison={t2.scores}
            primaryLabel={`採用時 (${t1.type})`}
            comparisonLabel={`1年後 (${t2.type})`}
          />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-500 tracking-widest mb-3">
            軸別変化量
          </h2>
          <div className="space-y-2">
            {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
              const d = delta[k];
              const tone =
                d > 0 ? "text-emerald-600" : d < 0 ? "text-rose-600" : "text-gray-500";
              return (
                <div key={k} className="bg-white border border-quad-line rounded p-3 flex items-baseline justify-between">
                  <div className="font-mono">
                    <span className="font-bold mr-2">{k}</span>
                    {t1.scores[k]} → {t2.scores[k]}
                  </div>
                  <div className={"font-bold " + tone}>{sign(d)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">採用時スコア</h2>
        <ScoreTable scores={t1.scores} />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">1年後スコア</h2>
        <ScoreTable scores={t2.scores} />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">変化の解釈と配置最適化提案</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800 mb-3">
            {error}
            <div className="mt-1 text-xs text-red-600">
              .env.local の ANTHROPIC_API_KEY を確認してください。
            </div>
          </div>
        )}
        <article className="bg-white border border-quad-line rounded-lg p-6 min-h-[200px]">
          {!text && loading && (
            <div className="text-gray-500 text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-quad-d animate-pulse mr-2" />
              生成中...
            </div>
          )}
          {text && (
            <div className="report-prose">
              <ReactMarkdown>{text}</ReactMarkdown>
              {loading && (
                <span className="inline-block w-2 h-4 bg-quad-d animate-pulse align-middle ml-1" />
              )}
            </div>
          )}
        </article>
      </section>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded border border-quad-line bg-white text-gray-700 hover:bg-gray-50"
        >
          ホームへ
        </button>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CompareInner />
    </Suspense>
  );
}
