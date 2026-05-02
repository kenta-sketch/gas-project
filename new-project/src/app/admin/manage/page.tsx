import Link from "next/link";
import { EMPLOYEES_SEED } from "@/data/employees";
import { judgeType } from "@/lib/scoring";

export default function ManageDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-quad-line pb-3">
        <div className="text-xs tracking-widest text-gray-500">マネジメント / MANAGE</div>
        <h1 className="text-2xl font-bold">社員一覧</h1>
        <p className="text-sm text-gray-600 mt-1">
          採用後の社員。マネジメントガイド・定期再診断・1年後比較などを各個人で参照可能。
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {EMPLOYEES_SEED.map((emp) => {
          const latest = emp.diagnoses[emp.diagnoses.length - 1];
          const type = latest ? judgeType(latest.scores) : "—";
          return (
            <Link
              key={emp.id}
              href={`/admin/manage/${emp.id}`}
              className="block bg-white border border-quad-line rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-lg font-bold">{emp.fullName}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-quad-paper border border-quad-line text-gray-600">
                  {emp.presetTendency}
                </span>
              </div>
              <dl className="text-sm text-gray-700 space-y-1 mb-4">
                <div className="flex">
                  <dt className="w-20 text-gray-500">入社日</dt>
                  <dd>{emp.hireDate}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 text-gray-500">配属</dt>
                  <dd className="font-semibold">{emp.currentRole}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 text-gray-500">上長</dt>
                  <dd>{emp.manager}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 text-gray-500">最新タイプ</dt>
                  <dd className="font-semibold">{type}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 text-gray-500">診断回数</dt>
                  <dd>{emp.diagnoses.length}回</dd>
                </div>
              </dl>
              <div className="text-xs text-quad-d font-semibold">詳細を開く →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
