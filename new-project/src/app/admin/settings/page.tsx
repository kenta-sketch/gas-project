"use client";

import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/store";
import { DEFAULT_SETTINGS } from "@/data/settings";
import type { Settings, StageId } from "@/lib/types";

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
