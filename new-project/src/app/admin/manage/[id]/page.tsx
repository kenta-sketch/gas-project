"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { findEmployee } from "@/data/employees";
import { dominantAxis } from "@/lib/scoring";
import { QuadRadar } from "@/components/RadarChart";
import { ScoreTable } from "@/components/ScoreTable";
import { EmotionBars } from "@/components/EmotionBars";
import { TypeInsight } from "@/components/TypeInsight";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { Employee, AxisKey, OneOnOne } from "@/lib/types";
import { addOneOnOne, listOneOnOnesFor, newOneOnOneId } from "@/lib/store";

type Tab = "overview" | "self" | "manager" | "compare" | "oneonone";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setEmployee(findEmployee(id) ?? null);
  }, [id]);

  if (!employee) {
    return (
      <div>
        <Link href="/admin/manage" className="text-quad-d text-sm">
          ← 社員一覧
        </Link>
        <div className="mt-4 text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const t1 = employee.diagnoses.find((d) => d.scenario === "採用時");
  const t2 = employee.diagnoses.find((d) => d.scenario === "1年後");
  const latest = employee.diagnoses[employee.diagnoses.length - 1];

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/manage" className="text-quad-d hover:underline">
          ← 社員一覧
        </Link>
      </div>

      <header className="bg-white border border-quad-line rounded-lg p-5">
        <div className="flex flex-wrap items-baseline gap-3 mb-3">
          <h1 className="text-2xl font-bold">{employee.fullName}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-quad-paper border border-quad-line text-gray-600">
            {employee.presetTendency}
          </span>
          <span
            className={
              "text-xs px-2 py-0.5 rounded-full border " +
              (employee.status === "在籍"
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-gray-50 border-gray-300 text-gray-600")
            }
          >
            {employee.status}
          </span>
        </div>
        <div className="grid gap-1 sm:grid-cols-3 text-sm text-gray-700">
          <div><span className="text-gray-500">入社日:</span> {employee.hireDate}</div>
          <div><span className="text-gray-500">配属:</span> {employee.currentRole}</div>
          <div><span className="text-gray-500">上長:</span> {employee.manager}</div>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {(
          [
            ["overview", "概要"],
            ["self", "自己分析レポート"],
            ["manager", "マネジメントガイド"],
            ["oneonone", "1on1 記録"],
            ["compare", "1年後比較"],
          ] as [Tab, string][]
        ).map(([t, label]) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors " +
                (active ? "border-brand-500 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700")
              }
            >
              {label}
            </button>
          );
        })}
      </nav>

      {tab === "overview" && latest && (
        <OverviewSection employee={employee} />
      )}
      {tab === "self" && latest && (
        <ReportSection
          kind="self"
          employee={employee}
          ageRange={employee.ageRange}
          gender={employee.gender}
          position={employee.currentRole}
          scoresKey={latest.date}
        />
      )}
      {tab === "manager" && latest && (
        <ReportSection
          kind="manager"
          employee={employee}
          ageRange={employee.ageRange}
          gender={employee.gender}
          position={employee.currentRole}
          scoresKey={latest.date}
        />
      )}
      {tab === "compare" && t1 && t2 && (
        <CompareSection employee={employee} />
      )}
      {tab === "compare" && (!t1 || !t2) && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm">
          採用時と1年後の両方の診断がそろっていないため、比較表示できません。
        </div>
      )}
      {tab === "oneonone" && latest && (
        <OneOnOneSection employee={employee} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 1on1 記録
// ──────────────────────────────────────────
function OneOnOneSection({ employee }: { employee: Employee }) {
  const [records, setRecords] = useState<OneOnOne[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [manager, setManager] = useState(employee.manager);
  const [topics, setTopics] = useState("");
  const [notes, setNotes] = useState("");
  const [nextActions, setNextActions] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);

  // AI suggestion
  const [suggestion, setSuggestion] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [sugError, setSugError] = useState<string | null>(null);

  useEffect(() => {
    setRecords(listOneOnOnesFor(employee.id));
  }, [employee.id, refresh]);

  function save() {
    if (!notes.trim()) return;
    addOneOnOne({
      id: newOneOnOneId(),
      employeeId: employee.id,
      date,
      manager,
      topics: topics.split(",").map((s) => s.trim()).filter(Boolean),
      notes,
      nextActions: nextActions || undefined,
      mood,
    });
    setNotes("");
    setNextActions("");
    setTopics("");
    setRefresh((k) => k + 1);
  }

  async function suggest() {
    setSuggestion("");
    setSugError(null);
    setSuggesting(true);
    try {
      const latest = employee.diagnoses[employee.diagnoses.length - 1];
      const recentNotes = records
        .slice(0, 3)
        .map((r) => `[${r.date}] ${r.notes}`)
        .join("\n");
      const res = await fetch("/api/oneonone-suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          employeeName: employee.fullName,
          role: employee.currentRole,
          type: latest.type,
          scores: latest.scores,
          emotions: latest.emotions,
          recentNotes,
        }),
      });
      if (!res.ok) {
        setSugError(`APIエラー (${res.status}): ${(await res.text()).slice(0, 200)}`);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setSuggestion(acc);
      }
    } catch (e) {
      setSugError((e as Error).message);
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">AIによる次回1on1テーマ提案</h2>
          <button
            onClick={suggest}
            disabled={suggesting}
            className={
              "px-4 py-2 rounded-lg text-sm font-semibold " +
              (suggesting ? "bg-slate-200 text-slate-500" : "bg-brand-gradient text-white hover:shadow-md")
            }
          >
            {suggesting ? "生成中..." : "AIに提案させる"}
          </button>
        </div>
        {sugError && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 mb-2">{sugError}</div>
        )}
        {suggestion ? (
          <div className="report-prose text-sm">
            <ReactMarkdown>{suggestion}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            診断結果と直近の1on1メモから、次回1on1のテーマと進め方を提案します。
          </p>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
        <h2 className="font-bold text-slate-900 mb-3">1on1 記録を追加</h2>
        <div className="grid gap-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <div className="text-xs font-semibold text-slate-500 mb-1">日付</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <div className="text-xs font-semibold text-slate-500 mb-1">面談者</div>
              <input
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <div className="text-xs font-semibold text-slate-500 mb-1">トピック(カンマ区切り)</div>
            <input
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="例: 数字の進捗, メンタル面"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <div className="text-xs font-semibold text-slate-500 mb-1">メモ</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <div className="text-xs font-semibold text-slate-500 mb-1">次のアクション</div>
            <input
              value={nextActions}
              onChange={(e) => setNextActions(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">本人の状態(1〜5)</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setMood(v as 1 | 2 | 3 | 4 | 5)}
                  className={
                    "w-10 h-10 rounded-lg font-bold text-sm border " +
                    (mood === v
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white border-slate-200 hover:bg-slate-50")
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={save}
            disabled={!notes.trim()}
            className={
              "self-end px-4 py-2 rounded-lg font-semibold text-sm " +
              (notes.trim() ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-500")
            }
          >
            記録を保存
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-bold text-slate-900 mb-3">過去の1on1({records.length}件)</h2>
        {records.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm text-slate-500">
            記録なし
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-bold text-slate-900">{r.date} · {r.manager}</div>
                  {r.mood && (
                    <span className="text-xs text-slate-500">
                      状態: <span className="font-mono font-bold">{r.mood}/5</span>
                    </span>
                  )}
                </div>
                {r.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.topics.map((t, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-sm text-slate-700 whitespace-pre-line mb-2">{r.notes}</div>
                {r.nextActions && (
                  <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded p-2">
                    <strong>次のアクション:</strong> {r.nextActions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ──────────────────────────────────────────
// 概要
// ──────────────────────────────────────────
function OverviewSection({ employee }: { employee: Employee }) {
  const latest = employee.diagnoses[employee.diagnoses.length - 1];
  const dom = dominantAxis(latest.scores);
  return (
    <div className="space-y-5">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-quad-line rounded p-5">
          <h2 className="text-sm tracking-widest text-gray-500 mb-3">最新スコア (RADAR)</h2>
          <QuadRadar scores={latest.scores} primaryLabel={latest.scenario} />
        </div>
        <div className="space-y-3">
          <div className="bg-white border border-quad-line rounded p-4">
            <div className="text-xs tracking-widest text-gray-500 mb-1">最新タイプ</div>
            <div className="text-2xl font-bold">{latest.type}</div>
          </div>
          <div className="bg-white border border-quad-line rounded p-4">
            <div className="text-xs tracking-widest text-gray-500 mb-1">主エンジン</div>
            <div className="text-lg font-bold">{dom} ── {AXIS_LABEL_JA[dom]}</div>
          </div>
          <div className="bg-white border border-quad-line rounded p-4">
            <div className="text-xs tracking-widest text-gray-500 mb-1">診断履歴</div>
            <ul className="text-sm space-y-1">
              {employee.diagnoses.map((d, i) => (
                <li key={i}>
                  {d.date} · {d.scenario} · {d.type}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section>
        <h3 className="font-bold mb-2">A/B/C/D スコア</h3>
        <ScoreTable scores={latest.scores} />
      </section>
      <section>
        <h3 className="font-bold mb-2">5感情</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
          <EmotionBars emotions={latest.emotions} />
        </div>
      </section>
      <section>
        <TypeInsight type={latest.type} variant="brief" />
      </section>
    </div>
  );
}

// ──────────────────────────────────────────
// レポートセクション(self / manager 共通)
// ──────────────────────────────────────────
function ReportSection({
  kind,
  employee,
  ageRange,
  gender,
  position,
  scoresKey,
}: {
  kind: "self" | "manager";
  employee: Employee;
  ageRange: string;
  gender: string;
  position: string;
  scoresKey: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    const latest = employee.diagnoses[employee.diagnoses.length - 1];
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind,
            ageRange,
            gender,
            position,
            scores: latest.scores,
            emotions: latest.emotions,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, scoresKey]);

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800 mb-3">
          {error}
          <div className="mt-1 text-xs text-red-600">.env.local の ANTHROPIC_API_KEY を確認してください。</div>
        </div>
      )}
      <article className="bg-white border border-quad-line rounded-lg p-6 min-h-[400px]">
        {!text && loading && (
          <div className="text-gray-500 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-quad-d animate-pulse mr-2" />
            生成中...(Claude Sonnet 4.6)
          </div>
        )}
        {text && (
          <div className="report-prose">
            <ReactMarkdown>{text}</ReactMarkdown>
            {loading && <span className="inline-block w-2 h-4 bg-quad-d animate-pulse align-middle ml-1" />}
          </div>
        )}
      </article>
    </div>
  );
}

// ──────────────────────────────────────────
// 1年後比較
// ──────────────────────────────────────────
function CompareSection({ employee }: { employee: Employee }) {
  const t1 = employee.diagnoses.find((d) => d.scenario === "採用時")!;
  const t2 = employee.diagnoses.find((d) => d.scenario === "1年後")!;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: employee.fullName,
            ageRange: employee.ageRange,
            gender: employee.gender,
            roleAtHire: employee.currentRole,
            currentRole: employee.currentRole + "(1年経過)",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-quad-line rounded p-5">
          <h2 className="text-sm tracking-widest text-gray-500 mb-3">RADAR (重ね合わせ)</h2>
          <QuadRadar
            scores={t1.scores}
            comparison={t2.scores}
            primaryLabel={`採用時 (${t1.type})`}
            comparisonLabel={`1年後 (${t2.type})`}
          />
        </div>
        <div>
          <h2 className="text-sm tracking-widest text-gray-500 mb-3">軸別変化</h2>
          <div className="space-y-2">
            {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
              const d = t2.scores[k] - t1.scores[k];
              const tone = d > 0 ? "text-emerald-600" : d < 0 ? "text-rose-600" : "text-gray-500";
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
        <h2 className="font-bold mb-3">変化の解釈と配置最適化提案</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800 mb-3">
            {error}
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
              {loading && <span className="inline-block w-2 h-4 bg-quad-d animate-pulse align-middle ml-1" />}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
