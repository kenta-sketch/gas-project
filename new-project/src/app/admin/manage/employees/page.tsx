import Link from "next/link";
import { EMPLOYEES_SEED } from "@/data/employees";
import { judgeType } from "@/lib/scoring";

const TYPE_TONE: Record<string, string> = {
  理詰め型: "bg-blue-50 text-blue-700 border-blue-200",
  承認欲求型: "bg-amber-50 text-amber-700 border-amber-200",
  ワガママ型: "bg-rose-50 text-rose-700 border-rose-200",
  統合型: "bg-emerald-50 text-emerald-700 border-emerald-200",
  混合型: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function EmployeesListPage() {
  const teams = Array.from(new Set(EMPLOYEES_SEED.map((e) => e.team)));
  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/manage" className="text-brand-600 hover:underline">
          ← マネジメント
        </Link>
      </div>
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">EMPLOYEES</div>
        <h1 className="text-3xl font-bold text-slate-900">社員一覧</h1>
        <p className="text-sm text-slate-600 mt-1">チーム別に表示。クリックで個別ページへ。</p>
      </header>

      {teams.map((team) => {
        const members = EMPLOYEES_SEED.filter((e) => e.team === team);
        return (
          <section key={team}>
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-gradient rounded-full" />
              {team}
              <span className="text-xs font-medium text-slate-500">({members.length}名)</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {members.map((emp) => {
                const latest = emp.diagnoses[emp.diagnoses.length - 1];
                const type = latest ? judgeType(latest.scores) : "—";
                return (
                  <Link
                    key={emp.id}
                    href={`/admin/manage/${emp.id}`}
                    className="group block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-soft hover:shadow-card-hover transition-shadow"
                  >
                    <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                    <div className="p-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700">{emp.fullName}</h3>
                        <span className={"text-[11px] px-2 py-0.5 rounded-full border " + (TYPE_TONE[type] ?? TYPE_TONE["混合型"])}>
                          {type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-1">{emp.currentRole}</div>
                      <div className="text-[11px] text-slate-500">入社 {emp.hireDate} · 上長 {emp.manager}</div>
                      {latest && (
                        <div className="mt-2 flex gap-1 text-[10px]">
                          <ScoreChip axis="A" score={latest.scores.A} />
                          <ScoreChip axis="B" score={latest.scores.B} />
                          <ScoreChip axis="C" score={latest.scores.C} />
                          <ScoreChip axis="D" score={latest.scores.D} />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ScoreChip({ axis, score }: { axis: "A" | "B" | "C" | "D"; score: number }) {
  const tone =
    axis === "A" ? "bg-rose-50 text-rose-700 border-rose-200"
    : axis === "B" ? "bg-amber-50 text-amber-700 border-amber-200"
    : axis === "C" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <span className={"px-1.5 py-0.5 rounded border font-mono " + tone}>
      {axis}:{score}
    </span>
  );
}
