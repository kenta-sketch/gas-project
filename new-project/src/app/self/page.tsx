"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listStandaloneDiagnoses, deleteStandaloneDiagnosis } from "@/lib/store";
import { dominantAxis } from "@/lib/scoring";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { StandaloneDiagnosis } from "@/lib/types";

export default function SelfPortalPage() {
  const [diagnoses, setDiagnoses] = useState<StandaloneDiagnosis[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterName, setFilterName] = useState<string>("");

  useEffect(() => {
    setDiagnoses(listStandaloneDiagnoses());
  }, [refreshKey]);

  function handleDelete(id: string, fullName: string) {
    if (!confirm(`${fullName} の診断結果(${id})を削除しますか? この操作は取り消せません。`)) return;
    deleteStandaloneDiagnosis(id);
    setRefreshKey((k) => k + 1);
  }

  // 名前でフィルタ(空なら全部)
  const filtered = filterName
    ? diagnoses.filter((d) => d.profile.fullName.includes(filterName))
    : diagnoses;

  // 名前ごとにグループ化(同じ人の時系列を可視化)
  const groupedByName: Record<string, StandaloneDiagnosis[]> = {};
  for (const d of filtered) {
    const key = d.profile.fullName;
    if (!groupedByName[key]) groupedByName[key] = [];
    groupedByName[key].push(d);
  }
  // 各グループ内は日付降順
  for (const key of Object.keys(groupedByName)) {
    groupedByName[key].sort((a, b) => b.date.localeCompare(a.date));
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-2xl p-6 shadow-soft">
        <div className="text-[10px] tracking-[0.25em] uppercase text-brand-700 font-bold mb-2">
          SELF PORTAL · セルフ診断ポータル
        </div>
        <h1 className="text-2xl font-bold text-slate-900">あなたの診断履歴</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          このブラウザで実施したセルフ診断の履歴です。何度でも受け直し可能で、時系列で変化を追えます。
          <br />
          履歴はあなたのブラウザの中だけに保存されており、サーバには送信されません。
        </p>
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <Link
            href="/diagnose"
            className="inline-flex items-center gap-1 bg-brand-gradient text-white text-sm font-bold px-4 py-2 rounded shadow-sm hover:shadow-md"
          >
            <span>+</span>
            <span>新規診断を開始</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:underline"
          >
            ← トップへ
          </Link>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
        <div className="flex items-baseline gap-2">
          <label className="text-xs text-slate-500">名前でフィルタ</label>
          <input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="例: 内山"
            className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
          />
          <span className="text-xs text-slate-400">
            {filtered.length} / {diagnoses.length} 件
          </span>
        </div>
      </div>

      {diagnoses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <div className="text-slate-500 text-sm mb-3">まだセルフ診断の履歴がありません</div>
          <Link
            href="/diagnose"
            className="inline-block bg-brand-gradient text-white text-sm font-bold px-4 py-2 rounded"
          >
            最初の診断を始める →
          </Link>
        </div>
      ) : Object.keys(groupedByName).length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
          フィルタに合致する診断がありません。
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByName).map(([name, list]) => (
            <PersonGroup key={name} name={name} diagnoses={list} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonGroup({
  name,
  diagnoses,
  onDelete,
}: {
  name: string;
  diagnoses: StandaloneDiagnosis[];
  onDelete: (id: string, name: string) => void;
}) {
  const latest = diagnoses[0];
  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-soft">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-baseline justify-between">
        <div>
          <h2 className="font-bold text-slate-900">{name}</h2>
          <div className="text-xs text-slate-500 mt-0.5">
            {latest.profile.ageRange} · {latest.profile.gender}
            {latest.profile.optionalContext && ` · ${latest.profile.optionalContext}`}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/diagnose?previousId=${latest.id}`}
            className="text-xs px-3 py-1 rounded border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 font-bold"
          >
            + 再診断
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {diagnoses.map((d, idx) => {
          const prev = diagnoses[idx + 1];
          const deltaA = prev ? d.scores.A - prev.scores.A : null;
          const deltaB = prev ? d.scores.B - prev.scores.B : null;
          const deltaC = prev ? d.scores.C - prev.scores.C : null;
          const deltaD = prev ? d.scores.D - prev.scores.D : null;
          const dom = dominantAxis(d.scores);
          return (
            <div key={d.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-mono text-slate-500">{d.date}</span>
                    <span className="font-bold text-slate-900">{d.type}</span>
                    <span className="text-xs text-slate-500">
                      主軸 {dom} ({AXIS_LABEL_JA[dom]})
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-bold">
                        最新
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 font-mono">
                    A={d.scores.A} B={d.scores.B} C={d.scores.C} D={d.scores.D}
                    {prev && (
                      <span className="ml-2 text-slate-400">
                        Δ
                        <DeltaLabel d={deltaA} />,
                        <DeltaLabel d={deltaB} />,
                        <DeltaLabel d={deltaC} />,
                        <DeltaLabel d={deltaD} />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/diagnose/result/${d.id}`}
                    className="text-xs px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    結果を見る →
                  </Link>
                  <button
                    onClick={() => onDelete(d.id, d.profile.fullName)}
                    className="text-xs px-2 py-1 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-600"
                    title="削除"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DeltaLabel({ d }: { d: number | null }) {
  if (d === null) return <span>—</span>;
  if (d === 0) return <span className="text-slate-400"> 0</span>;
  if (d > 0) return <span className="text-emerald-600"> +{d}</span>;
  return <span className="text-rose-600"> {d}</span>;
}
