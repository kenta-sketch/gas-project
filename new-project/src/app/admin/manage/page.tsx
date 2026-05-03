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
  const teams = Array.from(new Set(EMPLOYEES_SEED.map((e) => e.team)));
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">マネジメント / MANAGE</div>
        <h1 className="text-3xl font-bold text-slate-900">タレントマネジメント</h1>
        <p className="text-sm text-slate-600 mt-1">
          採用済み社員の継続支援。クアッドマインド理論を基盤とした各種マネジメント機能。
        </p>
      </header>

      {/* CTM-style feature cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon="👥"
          title="社員一覧"
          desc="個別社員プロフィール・診断履歴・自己分析レポート・マネジメントガイドへ"
          href="/admin/manage/employees"
          accent="emerald"
        />
        <FeatureCard
          icon="⚖️"
          title="チームバランス"
          desc="チーム別に4軸の分布を可視化。不足軸・過剰軸を検知し補強候補を提案"
          href="/admin/manage/team-balance"
          accent="indigo"
        />
        <FeatureCard
          icon="🗺️"
          title="タレントマップ"
          desc="EQ × IQ で社員をプロット。9-box タレントレビュー視点と Quad Mind 軸を統合"
          href="/admin/manage/talent-map"
          accent="purple"
        />
        <FeatureCard
          icon="🎯"
          title="配置最適化"
          desc="役割を選んで適性社員をランク。Quad Mind理論に基づく配置シミュレーション"
          href="/admin/manage/placement"
          accent="amber"
        />
        <FeatureCard
          icon="💬"
          title="1on1 サポート"
          desc="個別社員ページから記録・AI次回テーマ提案・状態モニタリング"
          href="/admin/manage/employees"
          accent="rose"
        />
        <FeatureCard
          icon="📈"
          title="再診断 / 1年後比較"
          desc="定期再診断で時系列変化を追跡。配置最適化提案を自動生成(個別社員ページ内)"
          href="/admin/manage/employees"
          accent="cyan"
        />
      </section>

      {/* チーム概要 */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">チーム概要</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((team) => {
            const members = EMPLOYEES_SEED.filter((e) => e.team === team);
            return (
              <div
                key={team}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft"
              >
                <div className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold mb-1">
                  TEAM
                </div>
                <div className="font-bold text-slate-900 mb-2">{team}</div>
                <div className="text-2xl font-bold text-brand-600">{members.length}<span className="text-sm text-slate-500 ml-1">名</span></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 社員一覧 (簡易表示) */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">社員一覧</h2>
          <Link href="/admin/manage/employees" className="text-sm text-brand-600 font-semibold hover:text-brand-700">
            すべて見る →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {EMPLOYEES_SEED.slice(0, 6).map((emp) => {
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
                    <span
                      className={
                        "text-[11px] px-2 py-0.5 rounded-full border " + (TYPE_TONE[type] ?? TYPE_TONE["混合型"])
                      }
                    >
                      {type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">{emp.team} · {emp.currentRole}</div>
                  <div className="text-[11px] text-slate-500">入社 {emp.hireDate} · 上長 {emp.manager}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  href,
  accent,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
  accent: "emerald" | "indigo" | "purple" | "amber" | "rose" | "cyan";
}) {
  const accentBar: Record<string, string> = {
    emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    indigo: "bg-gradient-to-r from-indigo-400 to-indigo-600",
    purple: "bg-gradient-to-r from-purple-400 to-purple-600",
    amber: "bg-gradient-to-r from-amber-400 to-amber-600",
    rose: "bg-gradient-to-r from-rose-400 to-rose-600",
    cyan: "bg-gradient-to-r from-cyan-400 to-cyan-600",
  };
  return (
    <Link
      href={href}
      className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className={"h-1 " + accentBar[accent]} />
      <div className="p-5">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand-700">{title} →</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}
