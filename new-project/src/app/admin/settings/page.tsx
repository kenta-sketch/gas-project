"use client";

import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/store";
import { DEFAULT_SETTINGS } from "@/data/settings";
import type { AxisKey, CompanyProfile, Settings, StageId } from "@/lib/types";
import { AXIS_LABEL_JA } from "@/lib/types";

const QUALITY_OPTIONS = [
  "熱意",
  "コミュニケーション能力",
  "論理的思考",
  "突破力",
  "共感力",
  "持続性",
  "創造性",
  "規範意識",
  "経験圧縮による直感",
  "場の空気を読む力",
  "リスク管理",
  "場の心理的安全性を作る力",
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function updateLabel(stage: StageId, label: string) {
    setSettings((s) => ({ ...s, stageLabels: { ...s.stageLabels, [stage]: label } }));
  }

  function updateCompany<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setSettings((s) => ({
      ...s,
      company: { ...(s.company ?? {}), [key]: value },
    }));
  }

  function updateAxisBalance(axis: AxisKey, value: number) {
    setSettings((s) => ({
      ...s,
      company: {
        ...(s.company ?? {}),
        axisBalance: { ...(s.company?.axisBalance ?? {}), [axis]: value },
      },
    }));
  }

  function toggleQuality(q: string) {
    setSettings((s) => {
      const current = s.company?.emphasizedQualities ?? [];
      const next = current.includes(q) ? current.filter((x) => x !== q) : [...current, q];
      return { ...s, company: { ...(s.company ?? {}), emphasizedQualities: next } };
    });
  }

  function save() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function reset() {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <div className="text-xs tracking-widest text-gray-500">SETTINGS</div>
        <h1 className="text-2xl font-bold">採用フロー設定</h1>
        <p className="text-sm text-gray-600 mt-1">
          応募フォームの入力モード、選考段階のラベルを企業ごとにカスタマイズします。
        </p>
      </header>

      <section className="bg-white border border-quad-line rounded-lg p-6 space-y-3">
        <h2 className="font-bold">入力モード</h2>
        <p className="text-sm text-gray-600">
          応募者が経歴情報を入力する方法を選択します。
        </p>
        <div className="space-y-2">
          {(
            [
              ["questions", "質問形式のみ", "応募フォームで学歴・職歴・自己PRをテキスト入力してもらう"],
              ["resume", "履歴書アップロードのみ", "PDF/画像でアップ → AIが解析して構造化データに変換"],
              ["both", "両方併用 (推奨)", "情報の抜け漏れが少ない。整合性も確認可能"],
            ] as const
          ).map(([v, label, desc]) => {
            const sel = settings.inputMode === v;
            return (
              <button
                key={v}
                onClick={() => update("inputMode", v)}
                className={
                  "w-full text-left p-3 rounded border transition-colors " +
                  (sel ? "bg-quad-d/10 border-quad-d ring-1 ring-quad-d" : "bg-white border-quad-line hover:bg-gray-50")
                }
              >
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs text-gray-600 mt-1">{desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white border border-quad-line rounded-lg p-6 space-y-3">
        <h2 className="font-bold">選考段階のラベル</h2>
        <p className="text-sm text-gray-600">
          自社の選考フローに合わせてラベルを変更できます(例: 1次 → 一次面接、最終 → 役員面接)。
        </p>
        <div className="space-y-2">
          {settings.stageOrder.map((stage) => {
            const fixed = stage === "applied" || stage === "hired" || stage === "rejected";
            return (
              <div key={stage} className="grid grid-cols-3 gap-3 items-center">
                <div className="text-xs font-mono text-gray-500">{stage}{fixed && " (固定)"}</div>
                <input
                  className="col-span-2 border border-quad-line rounded px-3 py-2 text-sm"
                  value={settings.stageLabels[stage]}
                  onChange={(e) => updateLabel(stage, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          選考段数の追加/削除は本番版で対応(現在のデモは applied / 1次 / 2次 / 最終 / hired / rejected の6段固定)。
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-50/30 to-white border border-brand-200 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="font-bold">会社プロファイル(AI個別分析で参照)</h2>
          <p className="text-sm text-slate-600 mt-1">
            理念・求める人物像・4軸の理想バランス・重視する性質を設定すると、AI個別分析が
            「この応募者は当社の方向性とどう合うか」を踏まえて出力されます。
            未設定の場合は会社文脈なしで分析されます。
          </p>
        </div>

        <label className="block">
          <div className="text-xs tracking-widest text-slate-500 mb-1">会社名(任意)</div>
          <input
            type="text"
            value={settings.company?.companyName ?? ""}
            onChange={(e) => updateCompany("companyName", e.target.value)}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
            placeholder="例: 株式会社サンプル"
          />
        </label>

        <label className="block">
          <div className="text-xs tracking-widest text-slate-500 mb-1">理念・ミッション</div>
          <textarea
            value={settings.company?.philosophy ?? ""}
            onChange={(e) => updateCompany("philosophy", e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
            placeholder="例: 顧客の課題を構造で解決し、現場発の革新を支える"
          />
        </label>

        <label className="block">
          <div className="text-xs tracking-widest text-slate-500 mb-1">求める人物像</div>
          <textarea
            value={settings.company?.idealCandidate ?? ""}
            onChange={(e) => updateCompany("idealCandidate", e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
            placeholder="例: 自走できる、相手の感情を読みつつ論理で説明できる、長期視点を持てる"
          />
        </label>

        <div>
          <div className="text-xs tracking-widest text-slate-500 mb-2">4軸の理想バランス(各 0〜5、重視度)</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(["A", "B", "C", "D"] as AxisKey[]).map((k) => {
              const val = settings.company?.axisBalance?.[k] ?? 0;
              return (
                <div key={k} className="bg-white border border-slate-200 rounded p-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-bold text-sm">
                      {k} <span className="text-slate-500 font-normal text-xs">({AXIS_LABEL_JA[k]})</span>
                    </span>
                    <span className="font-mono text-sm">{val}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={val}
                    onChange={(e) => updateAxisBalance(k, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs tracking-widest text-slate-500 mb-2">重視する性質(複数選択可)</div>
          <div className="flex flex-wrap gap-1.5">
            {QUALITY_OPTIONS.map((q) => {
              const sel = settings.company?.emphasizedQualities?.includes(q) ?? false;
              return (
                <button
                  key={q}
                  onClick={() => toggleQuality(q)}
                  className={
                    "text-xs px-3 py-1.5 rounded-full border transition-colors " +
                    (sel
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700")
                  }
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <div className="text-xs tracking-widest text-slate-500 mb-1">追加コンテキスト(業種・規模・社風など)</div>
          <textarea
            value={settings.company?.context ?? ""}
            onChange={(e) => updateCompany("context", e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
            placeholder="例: BtoB SaaS / 50名規模 / リモート併用 / 経営層と現場の距離が近い"
          />
        </label>
      </section>

      <div className="flex gap-3">
        <button
          onClick={save}
          className="px-5 py-2 rounded font-semibold bg-quad-d text-white hover:bg-blue-700"
        >
          保存
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded border border-quad-line bg-white text-gray-600 hover:bg-gray-50"
        >
          初期値に戻す
        </button>
        {saved && <span className="text-emerald-600 text-sm self-center">✓ 保存しました</span>}
      </div>
    </div>
  );
}
