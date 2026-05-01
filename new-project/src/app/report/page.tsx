"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { findCandidate } from "@/data/candidates";
import { loadSession } from "@/lib/store";
import type { SessionState } from "@/lib/store";

type Tab = "self" | "manager";

function ReportInner() {
  const params = useSearchParams();
  const router = useRouter();
  const candidateId = params.get("candidateId") ?? "";
  const scenario = (params.get("scenario") as "採用時" | "1年後") ?? "採用時";

  const candidate = findCandidate(candidateId);
  const [session, setSession] = useState<SessionState | null>(null);
  const [tab, setTab] = useState<Tab>("self");
  const [loadingTab, setLoadingTab] = useState<Record<Tab, boolean>>({
    self: false,
    manager: false,
  });
  const [text, setText] = useState<Record<Tab, string>>({ self: "", manager: "" });
  const [error, setError] = useState<string | null>(null);
  const requested = useRef<Record<Tab, boolean>>({ self: false, manager: false });

  useEffect(() => {
    setSession(loadSession());
  }, []);

  async function generate(kind: Tab) {
    if (!candidate || !session?.scores || !session.emotions) return;
    if (requested.current[kind] || text[kind]) return;
    requested.current[kind] = true;
    setLoadingTab((s) => ({ ...s, [kind]: true }));
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          ageRange: candidate.ageRange,
          gender: candidate.gender,
          position:
            scenario === "採用時"
              ? candidate.appliedPosition
              : candidate.appliedPosition + "(入社後1年経過)",
          scores: session.scores,
          emotions: session.emotions,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        setError(`APIエラー (${res.status}): ${errBody.slice(0, 200)}`);
        setLoadingTab((s) => ({ ...s, [kind]: false }));
        requested.current[kind] = false;
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) {
        setError("ストリーム取得失敗");
        return;
      }
      const decoder = new TextDecoder();
      let acc = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setText((s) => ({ ...s, [kind]: acc }));
      }
    } catch (e) {
      setError((e as Error).message);
      requested.current[kind] = false;
    } finally {
      setLoadingTab((s) => ({ ...s, [kind]: false }));
    }
  }

  useEffect(() => {
    if (session && candidate) generate(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tab]);

  if (!candidate) return <div>候補者が見つかりません。</div>;
  if (!session?.scores) {
    return (
      <div className="bg-amber-50 p-4 rounded border border-amber-200">
        診断データがありません。
        <button
          className="ml-2 underline"
          onClick={() => router.push(`/diagnose?candidateId=${candidateId}&scenario=${scenario}`)}
        >
          診断画面へ
        </button>
      </div>
    );
  }

  const current = text[tab];
  const isLoading = loadingTab[tab];

  return (
    <div className="space-y-6">
      <header className="border-b border-quad-line pb-4">
        <div className="text-xs tracking-widest text-gray-500">SCREEN 4 / 5</div>
        <h1 className="text-2xl font-bold">レポート ── {candidate.name}</h1>
        <div className="text-sm text-gray-600 mt-1">
          シナリオ: <span className="font-semibold">{scenario}</span> · タイプ: {session.type}
        </div>
      </header>

      <div className="flex gap-2 border-b border-quad-line">
        {(["self", "manager"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 font-semibold border-b-2 -mb-px transition-colors " +
              (tab === t
                ? "border-quad-d text-quad-d"
                : "border-transparent text-gray-500 hover:text-gray-700")
            }
          >
            {t === "self" ? "自己分析レポート (本人用)" : "マネジメントガイド (管理者用)"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
          {error}
          <div className="mt-2 text-xs text-red-600">
            ANTHROPIC_API_KEY が設定されているか、.env.local を確認してください。
          </div>
        </div>
      )}

      <article className="bg-white border border-quad-line rounded-lg p-6 min-h-[400px]">
        {!current && isLoading && (
          <div className="text-gray-500 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-quad-d animate-pulse mr-2" />
            生成中...(Claude Sonnet 4.6)
          </div>
        )}
        {current && (
          <div className="report-prose">
            <ReactMarkdown>{current}</ReactMarkdown>
            {isLoading && (
              <span className="inline-block w-2 h-4 bg-quad-d animate-pulse align-middle ml-1" />
            )}
          </div>
        )}
        {!current && !isLoading && !error && (
          <div className="text-gray-400 text-sm">レポートを生成中...</div>
        )}
      </article>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/result?candidateId=${candidateId}&scenario=${scenario}`)}
          className="px-4 py-2 rounded border border-quad-line bg-white text-gray-700 hover:bg-gray-50"
        >
          ← スコア結果に戻る
        </button>
        {scenario === "1年後" && (
          <Link
            href={`/compare?candidateId=${candidateId}`}
            className="flex-1 text-center bg-quad-c text-white font-semibold py-3 rounded hover:bg-emerald-700"
          >
            1年後の変化を見る →
          </Link>
        )}
        {scenario === "採用時" && (
          <Link
            href={`/?`}
            className="flex-1 text-center bg-quad-paper border border-quad-line text-gray-700 font-semibold py-3 rounded hover:bg-gray-100"
          >
            別の候補者を診断
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ReportInner />
    </Suspense>
  );
}
