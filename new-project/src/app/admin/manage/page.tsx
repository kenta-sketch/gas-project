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

export default function ManageDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">マネジメント / MANAGE</div>
        <h1 className="text-3xl font-bold text-slate-900">社員一覧</h1>
        <p className="text-sm text-slate-600 mt-1">
          採用後の社員。マネジメントガイド・定期再診断・1年後比較を各個人で参照可能。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EMPLOYEES_SEED.map((emp) => {
          const latest = emp.diagnoses[emp.diagnoses.length - 1];
          const type = latest ? judgeType(latest.scores) : "—";
          return (
            <Link
              key={emp.id}
              href={`/admin/manage/${emp.id}`}
              className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              <div className="p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">{emp.fullName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                    {emp.presetTendency}
                  </span>
                </div>
                <dl className="text-sm text-slate-700 space-y-1.5 mb-4">
                  <Row label="入社日" value={emp.hireDate} />
                  <Row label="配属" value={emp.currentRole} bold />
                  <Row label="上長" value={emp.manager} />
                  <Row label="診断回数" value={`${emp.diagnoses.length}回`} />
                </dl>
                <div className="flex items-center justify-between">
                  <span
                    className={
                      "text-xs px-2 py-0.5 rounded-full border font-medium " + (TYPE_TONE[type] ?? TYPE_TONE["混合型"])
                    }
                  >
                    {type}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">詳細を開く →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex">
      <dt className="w-20 text-slate-500">{label}</dt>
      <dd className={bold ? "font-semibold text-slate-900" : ""}>{value}</dd>
    </div>
  );
}
