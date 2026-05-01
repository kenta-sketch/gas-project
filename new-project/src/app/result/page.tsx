"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { findCandidate } from "@/data/candidates";
import { loadSession } from "@/lib/store";
import { dominantAxis } from "@/lib/scoring";
import { QuadRadar } from "@/components/RadarChart";
import { EmotionBars } from "@/components/EmotionBars";
import { ScoreTable } from "@/components/ScoreTable";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { SessionState } from "@/lib/store";

const TYPE_BADGE: Record<string, string> = {
  理詰め型: "bg-quad-d/10 text-quad-d border-quad-d",
  承認欲求型: "bg-quad-b/10 text-amber-700 border-quad-b",
  ワガママ型: "bg-quad-a/10 text-rose-700 border-quad-a",
  統合型: "bg-quad-c/10 text-emerald-700 border-quad-c",
  混合型: "bg-gray-100 text-gray-700 border-gray-300",
};

function FitVerdict({
  appliedPosition,
  type,
  dominant,
}: {
  appliedPosition: string;
  type: string;
  dominant: string;
}) {
  let verdict: "適合" | "条件付き適合" | "別職種推奨" = "条件付き適合";
  let reason = "";

  if (appliedPosition.includes("営業")) {
    if (dominant === "B" || dominant === "A") {
      verdict = "適合";
      reason = "対人感受性・関係構築の主エンジンが営業職に直接寄与する";
    } else if (dominant === "D") {
      verdict = "条件付き適合";
      reason = "提案ロジック構築に強み。情緒的な顧客対応では補助メンバーが必要";
    } else {
      verdict = "条件付き適合";
      reason = "経験圧縮型の判断は個人営業で活きるが、関係構築の継続支援が必要";
    }
  } else if (appliedPosition.includes("リーダー")) {
    if (type === "統合型") {
      verdict = "適合";
      reason = "全軸が一定水準で偏りが少なく、リーダー適性の核となる統合状態";
    } else if (type === "承認欲求型" || type === "理詰め型") {
      verdict = "条件付き適合";
      reason = "リーダー適性は段階的。1on1強化と権限移譲の慎重な設計が必要";
    } else {
      verdict = "別職種推奨";
      reason = "現段階ではプレイヤーとして強みが活きる配置を推奨";
    }
  } else {
    verdict = "適合";
    reason = "応募職種に対し主エンジンが阻害的な構造ではない";
  }

  const tone =
    verdict === "適合"
      ? "border-quad-c bg-emerald-50"
      : verdict === "条件付き適合"
        ? "border-quad-b bg-amber-50"
        : "border-quad-a bg-rose-50";

  return (
    <div className={"border-l-4 rounded p-4 " + tone}>
      <div className="text-xs tracking-widest text-gray-500 mb-1">適合度判定</div>
      <div className="text-lg font-bold mb-1">
        {appliedPosition} → {verdict}
      </div>
      <div className="text-sm text-gray-700">{reason}</div>
      <div className="text-xs text-gray-500 mt-2">
        ※ 本番では履歴書 / 面接の3軸クロス検証で精度向上(整合性チェック=核心機能)
      </div>
    </div>
  );
}

function ResultInner() {
  const params = useSearchParams();
  const router = useRouter();
  const candidateId = params.get("candidateId") ?? "";
  const scenario = (params.get("scenario") as "採用時" | "1年後") ?? "採用時";

  const candidate = findCandidate(candidateId);
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  if (!candidate) {
    return <div>候補者が見つかりません。</div>;
  }
  if (!session || !session.scores) {
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

  const { scores, emotions, type } = session;
  const dom = dominantAxis(scores);

  return (
    <div className="space-y-8">
      <header className="border-b border-quad-line pb-4">
        <div className="text-xs tracking-widest text-gray-500">SCREEN 3 / 5</div>
        <h1 className="text-2xl font-bold">スコア結果 ── {candidate.name}</h1>
        <div className="text-sm text-gray-600 mt-1">
          シナリオ: <span className="font-semibold">{scenario}</span> · {candidate.ageRange} {candidate.gender} · 応募 {candidate.appliedPosition}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-quad-line rounded p-5">
          <h2 className="text-sm font-bold text-gray-500 tracking-widest mb-3">QUAD MIND RADAR</h2>
          <QuadRadar scores={scores} primaryLabel={scenario} />
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs tracking-widest text-gray-500">タイプ判定</div>
            <span className={"inline-block mt-2 px-3 py-1 rounded-full font-bold border " + (TYPE_BADGE[type ?? "混合型"] ?? TYPE_BADGE["混合型"])}>
              {type}
            </span>
          </div>
          <div>
            <div className="text-xs tracking-widest text-gray-500 mb-1">主エンジン</div>
            <div className="text-lg font-bold">
              {dom} ── {AXIS_LABEL_JA[dom]}
            </div>
          </div>
          <FitVerdict
            appliedPosition={candidate.appliedPosition}
            type={type ?? "混合型"}
            dominant={dom}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">A/B/C/Dスコア</h2>
        <ScoreTable scores={scores} />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">5感情</h2>
        <div className="bg-white border border-quad-line rounded p-5">
          {emotions && <EmotionBars emotions={emotions} />}
        </div>
      </section>

      <section className="flex gap-3">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded border border-quad-line bg-white text-gray-700 hover:bg-gray-50"
        >
          ホームに戻る
        </button>
        <Link
          href={`/report?candidateId=${candidateId}&scenario=${scenario}`}
          className="flex-1 text-center bg-quad-d text-white font-semibold py-3 rounded hover:bg-blue-700"
        >
          レポートを生成 →
        </Link>
        {scenario === "1年後" && (
          <Link
            href={`/compare?candidateId=${candidateId}`}
            className="flex-1 text-center bg-quad-c text-white font-semibold py-3 rounded hover:bg-emerald-700"
          >
            1年後の変化を見る →
          </Link>
        )}
      </section>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ResultInner />
    </Suspense>
  );
}
