"use client";

// 中央DB(Supabase)にたまった診断結果の一覧
// データソース: GET /api/diagnoses(service_role キー経由)

import { useEffect, useState } from "react";
import Link from "next/link";
import { TYPE_DISPLAY_NAME } from "@/data/typeDescriptions";
import { TYPE_TONE, TYPE_TONE_DEFAULT } from "@/components/TypeTone";
import type { QuadType } from "@/lib/types";

interface Row {
  id: string;
  created_at: string;
  client_diagnosis_id: string | null;
  version: string;
  profile: {
    fullName?: string;
    ageRange?: string;
    gender?: string;
    optionalContext?: string;
  };
  scores: { A?: number; B?: number; C?: number; D?: number };
  emotions: Record<string, number>;
  quad_type: string;
  result?: {
    bSeparation?: { classification?: string; internal?: number; external?: number };
    conflict?: { flag?: boolean };
    aSeparation?: { classification?: string; frozen?: boolean; internal?: number; external?: number };
    platform?: { status?: string };
  };
}

export default function ResponsesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagnoses")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? `取得エラー (${res.status})`);
          setRows([]);
          return;
        }
        setRows(data.rows ?? []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "取得に失敗しました");
        setRows([]);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-bold">回答データ</h1>
        <span className="text-sm text-slate-500">
          共有リンクから受けてもらった診断結果が、ここに自動でたまります
        </span>
        {rows && (
          <span className="ml-auto text-sm font-bold text-slate-700">{rows.length} 件</span>
        )}
      </header>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
          ⚠ {error}
          <div className="text-xs mt-2 text-amber-700">
            Vercel の環境変数 <code className="font-mono bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            が未設定の可能性があります(設定 → 再デプロイで有効化)。
          </div>
        </div>
      )}

      {rows === null && <div className="text-sm text-slate-500">読み込み中...</div>}

      {rows && rows.length === 0 && !error && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
          まだデータがありません。共有リンク(/diagnose)から診断が完了すると、自動でここに追加されます。
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r) => {
            const t = r.quad_type as QuadType;
            const display = TYPE_DISPLAY_NAME[t] ?? r.quad_type;
            const tone = TYPE_TONE[t] ?? TYPE_TONE_DEFAULT;
            const flags: string[] = [];
            if (r.result?.bSeparation?.classification === "隠れ消耗型") flags.push("隠れ消耗");
            if (r.result?.conflict?.flag) flags.push("成長の入口");
            if (r.result?.aSeparation?.frozen) flags.push("凍結サイン");
            if (r.result?.platform?.status === "low") flags.push("コンディション低");
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full text-left p-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {r.profile?.fullName || "(名前なし)"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {r.profile?.ageRange} {r.profile?.gender}
                    </span>
                    <span className={"text-xs px-2 py-0.5 rounded-full border font-bold " + tone}>
                      {display}
                    </span>
                    {flags.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-orange-300 bg-orange-50 text-orange-700 font-bold"
                      >
                        {f}
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs font-mono text-slate-600">
                    <span>情熱 {r.scores?.A ?? "-"}</span>
                    <span>関係 {r.scores?.B ?? "-"}</span>
                    <span>洞察 {r.scores?.C ?? "-"}</span>
                    <span>論理 {r.scores?.D ?? "-"}</span>
                    <span className="text-slate-400">{r.version}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50 text-xs text-slate-700 space-y-2">
                    {r.profile?.optionalContext && <div>文脈: {r.profile.optionalContext}</div>}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <MiniStat label="内側の情熱" value={r.result?.aSeparation?.internal} />
                      <MiniStat label="外に出す情熱" value={r.result?.aSeparation?.external} />
                      <MiniStat label="内側で気にする" value={r.result?.bSeparation?.internal} />
                      <MiniStat label="外に出せる" value={r.result?.bSeparation?.external} />
                    </div>
                    <div className="text-slate-500">
                      感情: 不安{r.emotions?.fear ?? "-"} / 悲しみ{r.emotions?.sadness ?? "-"} / 怒り
                      {r.emotions?.anger ?? "-"} / 喜び{r.emotions?.joy ?? "-"} / 幸福
                      {r.emotions?.happiness ?? "-"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <footer className="text-xs text-slate-400">
        <Link href="/admin" className="text-brand-700 hover:underline">
          ← 管理トップへ
        </Link>
      </footer>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded p-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="font-bold font-mono text-slate-900">{value ?? "-"} / 25</div>
    </div>
  );
}
