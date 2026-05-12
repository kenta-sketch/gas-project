# Quad Mind 理論ナレッジ INDEX

このフォルダはクアッドマインド理論プロジェクトに関する全資料の索引。
材料が来たらここに1行追加し、本体は適切なサブフォルダへ。

最終更新: 2026-05-12(122人実証分析 → v3.0 強制選択式の実装差し戻し決定。v1.0 Likert を主に継続)

---

## フォルダ構成

| パス | 用途 |
|---|---|
| `master-structure.md` | プロジェクト全体構造図(随時更新) |
| `demo-spec-v1.md` | デモ画面開発仕様 v1 |
| `llm-prompts-v1.md` | レポート生成LLMプロンプト草案 v1 |
| `pdfs/` | 原本PDF/docx(重要な仕様書のみバイナリ保存) |
| `slides/` | スライド資料(Drive ID参照のみ) |
| `notes/` | テキスト断片・PDF整形済みノート |
| `voice/` | 音声書き起こし or 音声参照ノート |
| `scoring-db/` | 採点キーDB(json / csv / sql)機械可読データ |

---

## 4階層との対応

| 階層 | 主な資料 |
|---|---|
| **理論基盤層** | `notes/2026-05-06-quad-mind-theory.md` / `quad-vision-theory.md` / `love-philosophy.md` / `three-layer-integration.md` / `ab-structure.md` / `c-structure.md` / `observer.md` / `quad-mind-glossary.md` |
| **戦略層** | `notes/2026-05-06-academic-connection.md` / `brainjuice-proposal.md` / `reskilling-thoughts.md` / `line-chat-archive.md` |
| **診断層** | `master-structure.md`(統合)。詳細は理論基盤層の各ノート参照 |
| **操作層** | `notes/2026-05-06-corporate-design.md` / `quadmind-map.md` / `job-required-values.md` / `self-analysis-sample.md` / `management-guide-sample.md` / `battles-org-redesign-proposal.md` / `llm-prompts-v1.md` |

---

## 受信ログ(時系列)

### 2026-05-12 (★決定: v3.0実装差し戻し + 122人実証分析)

健太さん運用の既存 Google フォーム(v1.0 Likert形式)に **122人の生回答** が蓄積されている事実を発見。
内山健太・飯淵賢男 二人で実証データを確認した結果、**v3.0 強制選択式の本実装(コード)は差し戻し、v1.0 Likert ベースを継続採用**することに合意。

| 元ファイル | 整形ノート / 保存先 | 状態 |
|---|---|---|
| クアットマインド理論 診断結果.xlsx (122人 v1.0 Likert生データ) | `notes/2026-05-12-likert-120-empirical-analysis.md` + `scoring-db/2026-05-12-likert-120-respondents.xlsx` | ✓整形済(★決定ノート) |

**主な決定事項**:
- v3.0 強制選択式コード(`7a23161` / `7726d5a` / `ca28f82`)を revert
- v3.0 仕様書・採点キーDB(`3b1b728`)は `docs/theory/` 配下に保存して維持(将来の理論検証用)
- 自動保存機能(localStorage ドラフト)は v1.0 Likert コードベース上に再実装
- 次フェーズ: Response Style 第2層変数の実装、回答時間計測、C軸質問の見直し

### 2026-05-12 (採点エンジン v3.0 + 強制選択式 完全統合仕様書)

| 元ファイル | 整形ノート / 保存先 | 状態 |
|---|---|---|
| QuadMind 完全統合仕様書 Master.docx | `notes/2026-05-12-scoring-engine-v3.md` + `pdfs/2026-05-12-master-spec.docx` | ✓整形済(★最新版・v1.0 を強制選択式に全面更新) |
| quadmind scoring engine v33.pdf | `pdfs/2026-05-12-scoring-engine-v33.pdf` | ✓原本保存 |
| quadmind scoring db v3.json (288行) | `scoring-db/quadmind-scoring-db-v3.json` | ✓保存(機械可読) |
| quadmind scoring db v3.csv | `scoring-db/quadmind-scoring-db-v3.csv` | ✓保存(JSONから再生成) |
| quadmind scoring db v3.sql | `scoring-db/quadmind-scoring-db-v3.sql` | ✓保存(JSONから再生成) |

**主な変更点**: Likert 5段階 → **強制選択式 4択** / 単純合計 → **3スコア方式**(Axis / Preference / Low Evidence) / クロス加点 ×0.7 / 中立選択肢の独立記録 / Observer の完全分離。
**実装影響**: `types.ts` / `questions.ts` / `scoring.ts` / `apply/[token]/page.tsx` / `applicants.ts` の大規模改修が必要(詳細は `notes/2026-05-12-scoring-engine-v3.md` 末尾)。

### 2026-05-01 (初期セットアップ)

| 資料 | 場所 | 状態 |
|---|---|---|
| マスター構造図 | `master-structure.md` | 確定・随時更新 |
| デモ仕様書 v1 | `demo-spec-v1.md` | 確定 |
| LLMプロンプト草案 v1 | `llm-prompts-v1.md` | 実装組込済 |

### 2026-05-06 (Drive 25ファイル一括受領)

#### 理論基盤層 PDF

| 元ファイル | 整形ノート | 状態 |
|---|---|---|
| QuadMindTheory BRAINJUICE.pdf | `notes/2026-05-06-quad-mind-theory.md` | ✓整形済 |
| クアッドビジョン理論.pdf | `notes/2026-05-06-quad-vision-theory.md` | ✓整形済 |
| 「愛の哲学」BRAIN JUICE.pdf | `notes/2026-05-06-love-philosophy.md` | ✓整形済 |
| クアッドマインド三層統合論v2.pdf | `notes/2026-05-06-three-layer-integration.md` | ✓整形済 |
| AとBの構造論 QuadMind.pdf | `notes/2026-05-06-ab-structure.md` | ✓整形済 |
| Cの構造論 QuadMind.pdf | `notes/2026-05-06-c-structure.md` | ✓整形済 |
| Observer QuadMind.pdf | `notes/2026-05-06-observer.md` | ✓整形済 |
| クアッドマインド統合モデルの学術的接続.pdf(最新版) | `notes/2026-05-06-academic-connection.md` | ✓整形済(他2バージョンは重複のためスキップ) |

#### 操作層 docx

| 元ファイル | 整形ノート | 状態 |
|---|---|---|
| QuadMind 定義集.docx | `notes/2026-05-06-quad-mind-glossary.md` | ✓整形済 |
| QuadMind 企業向け完全設計書.docx | `notes/2026-05-06-corporate-design.md` | ✓整形済 |
| 職種別クアッドマインド必要値のメタ分析.docx | `notes/2026-05-06-job-required-values.md` | ✓整形済(73職種テーブル) |
| brainjuice proposal.docx | `notes/2026-05-06-brainjuice-proposal.md` | ✓整形済(三理論統合) |
| バッテス.docx | `notes/2026-05-06-battles-org-redesign-proposal.md` | ✓整形済(B2B提案書サンプル) |

#### 操作層 PDF(サンプル)

| 元ファイル | 整形ノート | 状態 |
|---|---|---|
| 自己分析レポート_サンプル.pdf | `notes/2026-05-06-self-analysis-sample.md` | ✓整形済(★プロンプト品質ベンチマーク) |
| マネジメントガイド サンプル.pdf | `notes/2026-05-06-management-guide-sample.md` | ✓整形済(★プロンプト品質ベンチマーク) |
| quadmind map.pdf | `notes/2026-05-06-quadmind-map.md` | ✓整形済(25職種精密版) |

#### 戦略層

| 元ファイル | 整形ノート | 状態 |
|---|---|---|
| リスキリング補助金論(テキスト) | `notes/2026-05-06-reskilling-thoughts.md` | ✓整形済 |
| LINEトーク全エクスポート | `notes/2026-05-06-line-chat-archive.md` | ⚠️ 参照ノートのみ(431KB、要チャンク処理) |

#### LINE抽出ノート(2026-05-06 チャンク処理で抽出)

| 元の発信日 | 整形ノート | 状態 |
|---|---|---|
| 2026-04-24 | `notes/2026-04-24-line-self-diagnosis.md` | ✓抽出済(健太さん v3.0 × 友人理論 統合分析、健康領域の停滞型診断) |
| 2026-04-25 | `voice/2026-04-25-line-AI-and-meaning.md` | ✓抽出済(AI時代の人間価値、「見た目はパスポート、内面は鍵」) |
| 2026-04-27 | `notes/2026-04-27-mbti-vs-quad-mind.md` | ✓抽出済(フロイト×アドラー × MBTI × クアッドマインド の位置づけ) |
| 2026-05-01 | `notes/2026-05-01-recruit-cross-verification.md` | ✓抽出済★(クアッドマインド数値 × 履歴書 採用分析手法) |
| 2026-05-01 | `notes/2026-05-01-end-of-academic-credentials.md` | ✓抽出済(学歴の時代は終わった/採用への適用) |
| 2026-05-03 | `notes/2026-05-03-japan-vs-brazil-civilization.md` | ✓抽出済(日本とブラジル / 真逆の文明構造) |

#### 音声・スライド・画像

| 元ファイル | 状態 | 備考 |
|---|---|---|
| 営業は才能ではなく配置の設計だ.m4a | `voice/2026-05-06-sales-talent-or-design.md` | ⚠️ 未書き起こし(40MB音声) |
| brainjuice 100q.pptx | `slides/.gitkeep` に Drive ID 記載 | スライド未開封 |
| brainjuice v3.pptx | `slides/.gitkeep` に Drive ID 記載 | スライド未開封 |
| 611059585662845085.jpg | `slides/.gitkeep` に Drive ID 記載 | 画像未開封 |
| Screenshot.png | `slides/.gitkeep` に Drive ID 記載 | スクショ未開封 |

---

## 整形済みノート 一覧(クイックアクセス)

### 理論コア(必読)
- [`notes/2026-05-06-quad-mind-glossary.md`](./notes/2026-05-06-quad-mind-glossary.md) ── 用語誤読防止リファレンス
- [`notes/2026-05-06-quad-mind-theory.md`](./notes/2026-05-06-quad-mind-theory.md) ── 第3版(2026年)本体
- [`notes/2026-05-06-three-layer-integration.md`](./notes/2026-05-06-three-layer-integration.md) ── 三層統合論
- [`notes/2026-05-06-ab-structure.md`](./notes/2026-05-06-ab-structure.md) ── AとBの深掘り
- [`notes/2026-05-06-c-structure.md`](./notes/2026-05-06-c-structure.md) ── Cの深掘り
- [`notes/2026-05-06-observer.md`](./notes/2026-05-06-observer.md) ── Observer(個人+組織)

### 周辺理論
- [`notes/2026-05-06-quad-vision-theory.md`](./notes/2026-05-06-quad-vision-theory.md) ── 未来想定×統合度の4象限
- [`notes/2026-05-06-love-philosophy.md`](./notes/2026-05-06-love-philosophy.md) ── 関係の循環としての愛
- [`notes/2026-05-06-academic-connection.md`](./notes/2026-05-06-academic-connection.md) ── 心理学・神経科学への接続

### サンプル(プロンプト品質ベンチマーク・最重要)
- [`notes/2026-05-06-self-analysis-sample.md`](./notes/2026-05-06-self-analysis-sample.md) ── 本人用レポート出力例
- [`notes/2026-05-06-management-guide-sample.md`](./notes/2026-05-06-management-guide-sample.md) ── 管理者用ガイド出力例

### 配置・職種(プロダクト機能設計に直結)
- [`notes/2026-05-06-quadmind-map.md`](./notes/2026-05-06-quadmind-map.md) ── 25職種精密版(★最重要)
- [`notes/2026-05-06-job-required-values.md`](./notes/2026-05-06-job-required-values.md) ── 73職種メタ分析
- [`notes/2026-05-06-corporate-design.md`](./notes/2026-05-06-corporate-design.md) ── 企業向け完全設計書

### 戦略・ピッチ
- [`notes/2026-05-06-brainjuice-proposal.md`](./notes/2026-05-06-brainjuice-proposal.md) ── 三理論統合提案書
- [`notes/2026-05-06-battles-org-redesign-proposal.md`](./notes/2026-05-06-battles-org-redesign-proposal.md) ── B2B提案書サンプル
- [`notes/2026-05-06-reskilling-thoughts.md`](./notes/2026-05-06-reskilling-thoughts.md) ── 国家政策との接続
- [`notes/2026-04-24-line-self-diagnosis.md`](./notes/2026-04-24-line-self-diagnosis.md) ── 友人理論×健太v3.0 統合分析
- [`voice/2026-04-25-line-AI-and-meaning.md`](./voice/2026-04-25-line-AI-and-meaning.md) ── AI時代の人間価値(肉声+書き起こし)
- [`notes/2026-04-27-mbti-vs-quad-mind.md`](./notes/2026-04-27-mbti-vs-quad-mind.md) ── フロイト/アドラー/MBTIとの位置づけ
- [`notes/2026-05-01-recruit-cross-verification.md`](./notes/2026-05-01-recruit-cross-verification.md) ── ★採用分析手法(数値×履歴書)
- [`notes/2026-05-01-end-of-academic-credentials.md`](./notes/2026-05-01-end-of-academic-credentials.md) ── 学歴の時代は終わった
- [`notes/2026-05-03-japan-vs-brazil-civilization.md`](./notes/2026-05-03-japan-vs-brazil-civilization.md) ── 日本×ブラジル文明比較

### ★ 診断仕様(プロダクト実装の決定版)
- [`notes/2026-05-12-iibuchi-action-items.md`](./notes/2026-05-12-iibuchi-action-items.md) ── ★★★ **飯淵さんへの課題まとめ(背景+論点+具体作業の整理、共有用)**
- [`notes/2026-05-12-session-log-decisions.md`](./notes/2026-05-12-session-log-decisions.md) ── ★★★ **2026-05-12 セッションログ(v3受領→差し戻し→第2層変数実装の全経緯)**
- [`notes/2026-05-12-likert-120-empirical-analysis.md`](./notes/2026-05-12-likert-120-empirical-analysis.md) ── ★★ **122人実証分析 + v3.0差し戻し決定**
- [`scoring-db/2026-05-12-likert-120-respondents.xlsx`](./scoring-db/2026-05-12-likert-120-respondents.xlsx) ── 122人の生回答データ
- [`notes/2026-05-11-diagnostic-spec-v1.md`](./notes/2026-05-11-diagnostic-spec-v1.md) ── **★ クアッドマインド診断 完全仕様書 v1.0 (G1〜G6完全実装版・現在の本流)**
- [`pdfs/2026-05-XX-diagnostic-spec-v1.pdf`](./pdfs/2026-05-XX-diagnostic-spec-v1.pdf) ── v1.0 原本PDF

### 強制選択式 v3.0 (アーカイブ・将来の理論検証用)
- [`notes/2026-05-12-scoring-engine-v3.md`](./notes/2026-05-12-scoring-engine-v3.md) ── 採点エンジン v3.0 + 強制選択式 完全統合仕様書(2026-05-12 受領)
- [`pdfs/2026-05-12-scoring-engine-v33.pdf`](./pdfs/2026-05-12-scoring-engine-v33.pdf) ── v3.0 原本PDF
- [`pdfs/2026-05-12-master-spec.docx`](./pdfs/2026-05-12-master-spec.docx) ── v3.0 完全統合仕様書 docx
- [`scoring-db/quadmind-scoring-db-v3.json`](./scoring-db/quadmind-scoring-db-v3.json) ── v3.0 採点キーDB(72問 × 4選択肢 = 288行)
- **注**: v3.0 のコード実装は 2026-05-12 に差し戻し(revert)。設計者2名でデータが機能しなかったため。仕様書とDBは将来の検証用に保存。

---

## 運用ルール

1. **材料が来たらチャットに投げる** ── 健太さんがこのスレッドに投稿
2. **私(Claude)が分類保存** ── 適切なフォルダ + 命名規則で保存
3. **INDEX.md に1行追加** ── 受信ログに日付付きで記録
4. **コミット & プッシュ** ── 自動でアーカイブされる

### 命名規則

- `notes/`: `YYYY-MM-DD-{slug}.md`(例: `2026-05-06-three-layer-integration.md`)
- `voice/`: `YYYY-MM-DD-{topic}.md`
- `pdfs/`: 原本は重いので Drive ID 参照に統一(ファイル本体は保存しない)
- `slides/`: 同上

### YAML フロントマター(必須)

```yaml
---
title: タイトル
source: 出所(友人作成 / 健太さん発話 / 健太さん経由 / 等)
layer: 理論基盤層 / 戦略層 / 診断層 / 操作層 のどれか
status: 受領済 / 検討中 / 確定
original_filename: (ある場合)
google_drive_id: (ある場合)
related:
  - 関連ファイル名
---
```

---

## 残タスク・未処理

- [x] **LINEトーク履歴の理論議論部分のチャンク抽出(2026年4-5月分)** ── 完了
- [x] **G1〜G6 理論ギャップの言語化** ── 友人が完全仕様書として提供(2026-05-11、`notes/2026-05-11-diagnostic-spec-v1.md`)
- [x] **★ G1〜G6 を Q1-Q9体系から75問体系へ実装移行**(完了。`d577621` Phase 1-3 + `67c05bb` で実装)
- [x] **採点エンジン v3.0 + 強制選択式 完全統合仕様書 受領**(2026-05-12、`notes/2026-05-12-scoring-engine-v3.md`)
- [x] **v3.0 強制選択式への実装移行**(完了したが設計者2名で機能せず、同日差し戻し)
- [x] **★ 122人実証データ分析と v3.0 差し戻し決定**(2026-05-12、`notes/2026-05-12-likert-120-empirical-analysis.md`)
- [x] **★ Response Style Profile を第2層変数として実装**(2026-05-12)
- [x] **Neutral Frequency を独立変数として実装**(2026-05-12)
- [x] **軸間相関補正を実装**(2026-05-12、C-D=0.37 / A-D=-0.20 / B-C=-0.18)
- [x] **回答時間ロギング**(2026-05-12、apply page でクライアント計測、ApplyDraft 永続化)
- [x] **2026-05-12 セッションログを保存**(`notes/2026-05-12-session-log-decisions.md`)
- [ ] **C軸質問の見直し**(SD=1.18 と弁別力低、特に「危険を直感で回避」SD=1.02 ── 飯淵さんと協議)
- [ ] **健全度指標表示**(C高=健全、B高=不健全の実証相関を本人向け画面にも反映)
- [ ] **第2層変数を活用した PersonalInsight 復活**(タイプ判定+第2層変数を入力としてAI個別化)
- [ ] **管理ダッシュボードで第2層変数を採用判定に活用**
- [ ] **時系列再診断 + 週次行動ログ機能**(改善②③)
- [ ] **12タイプ完全マッピング**を typeDescriptions に拡張
- [ ] **内部出力(管理職向け) vs 外部出力(本人向け)の分離表示**
- [ ] m4a音声「営業は才能ではなく配置の設計だ」の書き起こし
- [ ] brainjuice v3.pptx / 100q.pptx の内容取り込み(必要時)
- [ ] 画像2点の内容確認
- [ ] プロダクトの `src/lib/prompts.ts` を、サンプルレポート2点の構造に近づける(プロンプト品質検証)
- [x] `src/data/employees.ts` の dummy data に新ノート(quadmind-map.md)の25職種を反映
- [x] `/api/interview-questions` プロンプトを `2026-05-01-recruit-cross-verification.md` の整合性チェック手法で強化
