---
title: QuadMind 採点エンジン v3.0 + 強制選択式 完全統合仕様書
source: 友人作成(BRAIN JUICE 2026)
layer: 診断層
status: 受領済(2026-05-12) / 実装は未着手
original_filename:
  - QuadMind 完全統合仕様書 Master.docx
  - quadmind scoring engine v33.pdf
  - quadmind scoring db v3.json
  - quadmind scoring db v3.csv
  - quadmind scoring db v3.sql
google_drive_id:
  master_spec: 1pib9FCAKom2z3uX3EiRy9k2CnUzVwnHz
  engine_pdf: 1z_lA9UGx2RQRnxiM5gH1rkHtKQVnAx1V
  db_json: 1zS7mhTL6CUe_sXkMHE_h3fJQb1z2tBEX
  db_csv: 1_7b2Nc9QWbKcCN3VkfkbKO51vctFNVjy
  db_sql: 13GWUBcZ53y6c-so148YFktnm-0MpfSwi
related:
  - notes/2026-05-11-diagnostic-spec-v1.md
saved_files:
  - pdfs/2026-05-12-scoring-engine-v33.pdf
  - pdfs/2026-05-12-master-spec.docx
  - scoring-db/quadmind-scoring-db-v3.json
  - scoring-db/quadmind-scoring-db-v3.csv
  - scoring-db/quadmind-scoring-db-v3.sql
---

# QuadMind 採点エンジン v3.0 + 強制選択式 完全統合仕様書

2026-05-11 の `notes/2026-05-11-diagnostic-spec-v1.md` (G1〜G6 完全実装版) を **強制選択式 (Forced Choice)** へ全面更新した最新版。
質問数 72問 × 4選択肢 = **288 行の採点キーDB** が同梱されている。

---

## v1.0 → v3.0 の進化点

| 項目 | v1.0 (2026-05-11) | v3.0 (2026-05-12) |
|---|---|---|
| **質問形式** | Likert 5段階(1-5) | **強制選択式(a/b/c/d 4択)** |
| **採点** | 単純合計 | **3スコア方式**(Axis / Preference / Low Evidence) |
| **クロス加点** | なし | **×0.7 マトリクス採点** |
| **逆転項目** | 数値反転(6-値) | **3キー方式**(Primary Axis / Target Credit / Low Evidence) |
| **中立選択肢** | 無視 | **Neutral Frequency** 独立記録 |
| **Observer交絡** | あり | A/B/C/D **クロス点から完全除外** |
| **C軸の領域差し替え** | 部分対応 | ★マーク質問を職務領域で動的差替 + **×0.8補正** |
| **G3 責任感** | A型/B型/D型 9問 | 同じ(維持) |
| **G5 組織毀損** | 9問 | 同じ(維持) |
| **タイプ** | 12タイプ | 同じ(維持) |

---

## 設計思想(なぜ強制選択式か)

### 3世代の進化

1. **Gen 1 リッカート式**: 「どれくらい当てはまるか」1-5 → 理想の自分で答えられる。社会的望ましさバイアス最大。
2. **Gen 2 場面固定型**: 具体的な職場場面を提示 → 場面自体がBを誘発する別のバイアスを注入。
3. **Gen 3 強制選択式 (本仕様)**: v1.0 の質問文(内側の状態を問う)を維持しつつ、**選択肢だけを4択の行動分岐に変換**。

> 根拠: MBTI改良版 / NEO-PI-R 職業版 / 強制選択式 Big Five はすべて同方向に進化している。

### 強制選択式の設計原則(全問共通)

| 原則 | 内容 |
|---|---|
| ① | どの選択肢も「社会的に望ましく見える」状態を作る。正解が見えないようにする |
| ② | 選択肢 a〜d は必ず異なる4軸(A/B/C/D)の行動・反応に対応させる |
| ③ | v1.0 の質問文(内側の状態を問う文言)を基本とする。場面を限定しすぎない |
| ④ | 各選択肢の軸対応・採点キーを採点表に明示する(エンジンが迷わない) |
| ⑤ | コア質問3問 + 補助質問3問 + 逆転項目2問の構成を維持 |

---

## 3スコア方式

| スコア | 定義 | 用途 |
|---|---|---|
| **① Axis Score** | 軸の強さ。対象軸の Target Credit 加重合計を25点満点に正規化 | 本人向け表示(レーダー等) |
| **② Preference Score** | 反応の出やすさ。全質問を通じてどの軸の選択肢を選びやすいか | 「A質問でもB選択肢を選ぶ人 = A場面でもB処理を優先する人」という読み |
| **③ Low Evidence Index** | 対象軸の抑制・低証拠。逆転項目の Low Evidence 加重合計を正規化 | 内部判定のみ。真性低 vs 抑圧型 vs 管理型の判別 |

### 採点式

```
Axis Score X        = 25 × Σ(weight × Target Credit X) ÷ Σ(weight of X items)
Preference Score X  = Σ(weight × [Primary Axis = X])         (全質問通算)
Low Evidence X      = 25 × Σ(weight × Low Evidence X) ÷ Σ(weight of reverse X items)
```

### 採点ルール

| 質問種別 | 主軸加点 | クロス加点(他軸) | 正規化 |
|---|---|---|---|
| **コア質問**(各軸3問) | × 1.5 | × 0.7 | 25点 |
| **補助質問**(各軸3問) | × 1.0 | × 0.7 | 25点 |
| **逆転項目**(各軸2問) | 3キー方式 × 1.0 | × 0.7 | 25点 |
| **Observer**(OB/SW) | OB/SW専用 | A/B/C/Dから**完全除外** | 25点 |
| **C軸領域補正** | 職務領域外なら × 0.8 | | × 0.8補正 |

---

## 3キー方式(逆転項目の核心)

「逆転項目」は **数値反転ではなく**、対象軸が「出ない・抑制される・別軸に置換される」反応を検出する。
そのために選択肢ごとに3つのキーを記録する:

| キー | 定義 | 値 |
|---|---|---|
| **Primary Axis** | その選択肢が表している主反応軸 | A / B / C / D / null |
| **Target Credit** | 質問が測ろうとしている対象軸がどれだけ出ているか | 1.0 / 0.5 / 0 |
| **Low Evidence** | 対象軸が抑制・置換されている証拠 | 1.0 / 0.5 / 0 |

### 実装例: A-7「感情を表に出すことについて」

| 選択肢 | Primary | A Target Credit | A Low Evidence | 読み方 |
|---|---|---|---|---|
| a) 自然なこと | A | 1.0 | 0 | A表出が自然に機能 |
| b) 場と相手で使い分け | B | 0.5 | 0.5 | B介在。A表出部分的 |
| c) 状況の読み次第 | C | 0.5 | 0.5 | C介在。状況依存 |
| d) 大人として控える | D | 0 | 1.0 | Dによる抑制(A低証拠) |

**d を選んだ場合の処理 (二重の意味)**:
- Primary Axis Score: **D に +1.0** (Dが主反応軸)
- A Target Credit: A に +0 (Aの直接証拠なし)
- A Low Evidence: A低証拠 に **+1.0** (Aが抑制・置換されている証拠)

→ 「Dが高い人」ではなく「**A表出がD的に抑制されている人**」という構造で読む。

---

## 質問体系の全体(72問 × 4選択肢 = 288行)

| グループ | 内容 | 問数 | 採点軸 |
|---|---|---|---|
| **G1-A** | A軸(動物的感情) コア3 + 補助3 + 逆転2 | 8 | A |
| **G1-B** | B軸(機械的感情) コア3 + 補助3 + 逆転2 | 8 | B |
| **G1-C** | C軸(動物的理性) コア3 + 補助3 + 逆転2 ★領域差替 | 8 | C |
| **G1-D** | D軸(機械的理性) コア3 + 補助3 + 逆転2 | 8 | D |
| **G2-iA** | 内的A(感情の強さ) | 5 | iA |
| **G2-eA** | 表出A(外に出すか) | 5 | eA |
| **G2-FZ** | 凍結判別(条件付き表示) | 2 | FZ |
| **G4-OB** | Observer起動測定 | 5 | OB |
| **G4-SW** | 切り替え自覚測定 | 5 | SW |
| **G3-DR** | D型責任感 | 3 | DR |
| **G3-BR** | B型責任感 | 3 | BR |
| **G3-AR** | A型責任感 | 3 | AR |
| **G5-AG** | 組織毀損: 承認略奪型 | 3 | AG |
| **G5-RV** | 組織毀損: ルール暴力型 | 3 | RV |
| **G5-IM** | 組織毀損: 衝動暴走型 | 3 | IM |
| **合計** | | **72** | |

採点キーDB は `scoring-db/quadmind-scoring-db-v3.{json,csv,sql}` 参照。

---

## 中立選択肢の処理(Neutral Frequency)

「白背景の中立選択肢」は **捨てない**。独立変数として記録し、閾値超過でフラグを立てる。

| 変数 | 閾値 | フラグ |
|---|---|---|
| Neutral Frequency 全体 | 全問の 30% 以上 | 慢性疲弊 / 解離傾向 |
| A-Neutral Frequency | A軸質問の 50% 以上 | A無感覚フラグ |

### 判定組み合わせ

| Neutral | 内的A | 表出A | FZ | 判定 |
|---|---|---|---|---|
| 低 | 低 | 低 | - | 真性A低 → 着火体験を設計 |
| 低 | 高 | 低 | 高 | A凍結型 → 専門的支援を示唆 |
| 低 | 高 | 低 | 低 | A抑圧型 → 安全な表出環境設計 |
| 低 | 高 | 高 | - | A管理型 → 強みとして活用 |
| 高 | - | - | - | 解離・無感覚の可能性 → 再診断を促す |

---

## 12タイプ判定ロジック

判定優先順位:
1. **A凍結フラグ**(FZ-1 と FZ-2 が両方高) → 専門支援示唆を最優先
2. **G5 フラグ** → 内部用途のみ表示
3. **統合指数** = (Observer + 切り替え) ÷ 2 → 本物の統合 / 偽の中庸 / 部分統合
4. **A発火/表出の乖離** → A抑圧型 or 演技的表出フラグ付記
5. **主軸エンジン** = 最高 Axis Score
6. **副軸エンジン** = 2位 Axis Score
7. **責任感タイプ** → G3 の主責任感をプロファイルに付記

12タイプ:

| タイプ | 構造 | リスク | マネジメント |
|---|---|---|---|
| 統合型 | 全軸均衡 + Observer高 | 自分を失う | 引っ張る役割を与える |
| 突破型 | A主 + C副 | 持続性なし | 短期目標と成果見える化 |
| 共感型 | B主 + C副 | 抱え込み・燃え尽き | 負担量を明示管理 |
| 設計型 | D主 + C副 | 完璧主義 | 80点で動く許可 |
| 忠実型 | B主 + D副 | 変化抵抗 | 変化理由を丁寧に説明 |
| 直感型 | C主 + A副 + 領域内C高 | 言語化困難 | 「なぜ」を言語化させる |
| 分析型 | D主 + B副 | 正論支配 | 「伝わったか」を成果指標に |
| 蓄積型 | C主 + B副 | 決断遅さ | 決断期限を構造的設定 |
| **A抑圧型** | 内的A高・表出A低・B高 | 本音消失 | 安全な表出の場を先に設計 |
| **A凍結型** | 内的A高・表出A低・FZフラグ | 解離 | 専門支援を示唆 |
| **中庸偽装型** | 全軸均衡・Observer低 | 危機で機能しない | 再診断・具体場面で深掘り |
| **単独運転型** | 一軸突出・他軸低 | 視野狭窄 | 補完人材との組合せ |

---

## 既存実装(2026-05-11 版)との差分 — 実装への影響

| ファイル | 必要な変更 |
|---|---|
| `src/lib/types.ts` | `LikertValue (1-5)` → `OptionId ('a'\|'b'\|'c'\|'d')` に置き換え。`DiagnosticAnswers` の値型を `OptionId` に。3スコア用の型 `AxisScore` / `PreferenceScore` / `LowEvidenceIndex` を追加 |
| `src/lib/questions.ts` | 全質問のテキストはほぼ同じだが、各質問に4つの選択肢ラベル + 採点キーを追加。`OPTION_DEFS` (288行) を import |
| `src/lib/scoring.ts` | `computeFullDiagnosis` を全面書き換え。マトリクス採点(×0.7 クロス) + 3スコア計算 + Neutral Frequency + Low Evidence Index + 12タイプ判定ロジック |
| `src/app/apply/[token]/page.tsx` | 5択 Likert ボタン → 4択選択肢ボタンに UI 変更。質問ごとに4つの選択肢テキストを表示 |
| `src/data/applicants.ts` / `employees.ts` | 既存ダミーデータの `axis/aSeparation/integration/...` を新形式に変換 or 再生成 |
| `src/components/DiagnosticInsight.tsx` | Low Evidence / Neutral Frequency 表示の追加 |
| `src/lib/prompts.ts` | レポート生成プロンプトに Preference / Low Evidence / Neutral の解釈を追加 |

**規模感**: 全画面に影響する大規模改修 (推定: 数日〜1週間相当)。
ステージング(branch)で段階実装するのが安全。

---

## 次のアクション(候補)

### 短期(今日明日)
- [x] **Phase 0: 受領・保存** ─ ファイル5点を `pdfs/` `scoring-db/` `notes/` に保存(本コミット)
- [ ] **Phase 1: 型・スキーマ刷新** ─ `types.ts` + 採点キーDB の TypeScript 化(`src/data/scoring-db.ts`)
- [ ] **Phase 2: 質問文の4択化** ─ `questions.ts` を全72問 × 4選択肢に展開

### 中期
- [ ] **Phase 3: スコアエンジン書き換え** ─ `scoring.ts` を 3スコア方式に再実装
- [ ] **Phase 4: UI 切り替え** ─ Likert ボタン → 4択選択ボタン
- [ ] **Phase 5: ダミーデータ移行** ─ applicants.ts / employees.ts の回答を変換
- [ ] **Phase 6: 表示・プロンプト拡張** ─ Low Evidence / Neutral / 12タイプ判定理由をレポートに反映

### 長期(改善②③)
- [ ] 複数回受診の時系列スコア
- [ ] 週次行動ログ(言わなかった場面/感情先行/直感的中)
- [ ] 自己申告と行動ログの一致度フィードバック

---

## 参考(Drive 元ファイル)

| ファイル | Drive ID | サイズ |
|---|---|---|
| 完全統合仕様書 Master.docx | `1pib9FCAKom2z3uX3EiRy9k2CnUzVwnHz` | 52 KB |
| scoring engine v33.pdf | `1z_lA9UGx2RQRnxiM5gH1rkHtKQVnAx1V` | 592 KB |
| scoring db v3.json | `1zS7mhTL6CUe_sXkMHE_h3fJQb1z2tBEX` | 79 KB |
| scoring db v3.csv | `1_7b2Nc9QWbKcCN3VkfkbKO51vctFNVjy` | 12 KB |
| scoring db v3.sql | `13GWUBcZ53y6c-so148YFktnm-0MpfSwi` | 25 KB |
