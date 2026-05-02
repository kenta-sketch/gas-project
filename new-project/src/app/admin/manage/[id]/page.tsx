"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { findEmployee } from "@/data/employees";
import { dominantAxis } from "@/lib/scoring";
import { QuadRadar } from "@/components/RadarChart";
import { ScoreTable } from "@/components/ScoreTable";
import { EmotionBars } from "@/components/EmotionBars";
import { AXIS_LABEL_JA } from "@/lib/types";
import type { Employee, AxisKey } from "@/lib/types";

type Tab = "overview" | "self" | "manager" | "compare";

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

      <nav className="flex gap-1 border-b border-quad-line overflow-x-auto">
        {(
          [
            ["overview", "概要"],
            ["self", "自己分析レポート"],
            ["manager", "マネジメントガイド"],
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
                (active ? "border-quad-d text-quad-d" : "border-transparent text-gray-500 hover:text-gray-700")
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
        <div className="bg-amber-50 border border-quad-b/40 rounded p-4 text-sm">
          採用時と1年後の両方の診断がそろっていないため、比較表示できません。
        </div>
      )}
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
        <div className="bg-white border border-quad-line rounded p-5">
          <EmotionBars emotions={latest.emotions} />
        </div>
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
