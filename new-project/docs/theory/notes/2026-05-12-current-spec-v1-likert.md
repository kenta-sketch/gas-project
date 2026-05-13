---
title: クアッドマインド診断 現行仕様書 v1.0+(Likert + 第2層変数 + AI個別分析)
source: 2026-05-12 セッションで確定。内山健太 × 飯淵賢男 二者合意の上で実装
layer: 診断層
status: ★現行プロダクト仕様(現在の実装に対応)
related:
  - notes/2026-05-11-diagnostic-spec-v1.md (v1.0 理論仕様原本)
  - notes/2026-05-12-likert-120-empirical-analysis.md (122人実証分析)
  - notes/2026-05-12-session-log-decisions.md (決定の経緯)
  - notes/2026-05-12-scoring-engine-v3.md (v3 アーカイブ:将来検証用)
  - notes/2026-05-12-iibuchi-action-items.md (飯淵さんへの課題)
---

# クアッドマインド診断 現行仕様書 v1.0+

このドキュメントは、いまプロダクト(`new-project/`)で実際に動いている診断システムの **完全仕様** をまとめたもの。
何が動いているか / なぜそうなったか / 各層の役割 / 入出力データ構造 / 次のステップ がここを読めば全部わかる。

**この仕様書を読むべき人**:
- 飯淵さん(理論作者として現在の実装を把握するため)
- 内山さん(自分で作ったが整理されてないと迷うため)
- 新しい関係者(キャッチアップ用)
- 将来の自分(忘れた時用)

---

## 0. 一行で言うと

> **「Likert 5段階の75問診断(v1.0 理論)+ 122人実証データから導出した第2層変数 + AI 個別分析」の3層構造で動いている。**

v3.0 強制選択式の本実装は 2026-05-12 に差し戻し済み(理由は §1.4)。

---

## 1. 経緯(要約)

### 1.1 v1.0 (2026-05-11 受領、`67c05bb` で実装完了)
- 飯淵さんから「クアッドマインド診断 完全仕様書 v1.0」を受領
- G1〜G6 の完全実装版(12タイプ・75問体系・Likert 5段階)
- プロダクトにフル実装、preview Vercel で動作

### 1.2 v3.0 (2026-05-12 朝に受領、同日午後に差し戻し)
- 飯淵さんから「採点エンジン v3.0 + 強制選択式 完全統合仕様書」を受領
- プロダクトにフル実装(`7a23161`)してテスト
- **設計者2人(内山・飯淵)でテストしたら両方ともデータが機能しなかった**:
  - 内山: A=0, B=1.3, C=3.9, D=10.5(全軸異常に低い)
  - 飯淵: 内的A=0(熱意・鼓舞経歴と矛盾)、Switch満点なのに「単独運転」判定
- 原因: 「冷静に質問を読む人ほど中立(d)を選ぶ」構造問題

### 1.3 ★ 122人 Likert 実証データの発見(2026-05-12 午後)
- 内山さんが既存 Google フォームに 122人の生回答が蓄積されている事実を共有
- 軸間相関(C-D=0.37 等)、回答スタイル分布(穏当49%/極端18%)、健全度相関などが実証的に確認できた

### 1.4 ★★ 決定(2026-05-12、内山・飯淵 二者合意)
- **v1.0 Likert を本流コードとして継続**
- **v3.0 強制選択式コードは revert**(`docs/theory/` にはアーカイブ保存・将来検証用)
- **飯淵さんの懸念(2-4型と1-5型でブレる)は Response Style 第2層変数で吸収**

### 1.5 第2層変数の実装(2026-05-12 夜、`1f73b34`)
- Response Style Profile / Neutral Frequency / 軸間相関補正 / 回答時間ロギング を実装
- 122人実証から経験的閾値・補正値を引いた

### 1.6 AI個別分析(PersonalInsight)の実装(2026-05-12 夜、`1b86b5e`)
- 静的テンプレ(TYPE_DESCRIPTIONS)を診断結果タブ下部から AI 個別生成に差し替え
- 入力:診断結果 × 経歴 × 第2層変数 × プロフィール
- 出力:7フィールドの個別分析(同じタイプでも違う文章)

---

## 2. システム全体図

```
[応募者(本人)]
    ↓ /apply/{token} で 75問 Likert に回答
    ↓ + プロフィール / 経歴 / 履歴書PDF
[localStorage に自動保存(同じURLで再開可能)]
    ↓ 送信
    ↓
┌─────────────────────────────────────────────────┐
│ 第1層: 採点エンジン(src/lib/scoring.ts)        │
│ ─────────────────────────────────────────────── │
│  G1: A/B/C/D 軸スコア(0-25)                     │
│  G2: A発火/表出分離(内的A・表出A・FZ)          │
│  G3: 責任感3形態(D型/B型/A型)                  │
│  G4: 統合状態(Observer + Switch)               │
│  G5: 組織毀損プロファイル(AG/RV/IM、内部用)    │
│  G6: 12タイプ判定(優先順位ロジック)            │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 第2層: 回答メタ分析(2026-05-12 追加)            │
│ ─────────────────────────────────────────────── │
│  ① Response Style Profile(穏当/極端/中立等)    │
│  ② Neutral Frequency(中立3の選択率)            │
│  ③ 軸間相関補正(C-D=0.37 等を反映)             │
│  ④ 回答時間プロファイル(慎重/即断型)           │
└─────────────────────────────────────────────────┘
    ↓
[applicant.diagnoses[i] に保存 / localStorage]
    ↓
┌─────────────────────────────────────────────────┐
│ 第3層: AI個別分析(POST /api/personal-insight) │
│ ─────────────────────────────────────────────── │
│  入力: 第1+2層全部 + プロフィール + 経歴       │
│  処理: Claude(claude-sonnet-4-6)に投げる       │
│  出力: 7フィールドの個別分析 JSON               │
│  キャッシュ: applicant.diagnoses[i].personalInsight │
└─────────────────────────────────────────────────┘
    ↓
[管理者画面で表示]
  - 概要タブ: TypeInsight brief(静的・タイプ概要)
  - 診断結果タブ:
      ・上部: レーダー + スコア + 5感情
      ・中央: G2/G3/G4/G5 + 第2層変数(管理者向け)
      ・★下部: AI個別分析(動的・個別生成)
```

---

## 3. 第1層:採点エンジン(v1.0 理論準拠)

### 3.1 質問体系(75問)

| グループ | 問数 | 採点軸 | スコア範囲 |
|---|---|---|---|
| **G1-A** 動物的感情 8問 | 8 | A | 0-25 |
| **G1-B** 機械的感情 8問 | 8 | B | 0-25 |
| **G1-C** 動物的理性 8問 | 8 | C | 0-25 |
| **G1-D** 機械的理性 8問 | 8 | D | 0-25 |
| **G2-iA** 内的A 5問 | 5 | 内的A | 0-25 |
| **G2-eA** 表出A 5問 | 5 | 表出A | 0-25 |
| **G2-FZ** 凍結判別 2問 | 2 | FZ | 0-25 |
| **G4-OB** Observer 5問 | 5 | Observer | 0-30 |
| **G4-SW** Switch 5問 | 5 | Switch | 0-30 |
| **G3-DR** D型責任感 4問 | 4 | DR | 4-20 |
| **G3-BR** B型責任感 4問 | 4 | BR | 4-20 |
| **G3-AR** A型責任感 4問 | 4 | AR | 4-20 |
| **G5-AG** 承認略奪 3問 | 3 | AG | 3-15 |
| **G5-RV** ルール暴力 3問 | 3 | RV | 3-15 |
| **G5-IM** 衝動暴走 3問 | 3 | IM | 3-15 |
| **合計** | **75** | | |

各問は **Likert 5段階**(1〜5)で回答。各軸の合計を加算してスコアとする(`computeAxisScores`)。

### 3.2 G2: A発火/表出分離(`computeASeparation`)

```
内的A = iA-1 〜 iA-5 の合計を 25 点満点に正規化
表出A = eA-1 〜 eA-5 の合計を 25 点満点に正規化
FZ    = FZ-1 + FZ-2 の合計(凍結フラグ判定用)

判定:
  内的A<13 かつ 表出A<13 → 真性A低
  内的A≥13 かつ 表出A<13 かつ FZ高 → A凍結型
  内的A≥13 かつ 表出A<13 かつ FZ低 → A抑圧型
  内的A≥13 かつ 表出A≥13 → A管理型
  内的A<13 かつ 表出A≥13 → 演技的表出フラグ
```

### 3.3 G4: 統合状態(`computeIntegration`)

```
Observer = OB-1 〜 OB-5 の合計(0-30)
Switch   = SW-1 〜 SW-5 の合計(0-30)
統合指数 = (Observer + Switch) / 2

判定:
  指数≥20 かつ 全軸≥13 → 本物の統合
  指数≥20 かつ 一軸<10 → 部分統合
  指数<15 かつ 全軸均衡(max-min<8) → 偽の中庸
  それ以外 → 単独運転(fallback)
```

**既知の問題**: 中間ゾーン(15-20)が「単独運転」になる(飯淵さんの Switch=25 でこのバグに当たった)。次フェーズで判定ロジックの再設計が必要。

### 3.4 G3: 責任感3形態(`computeResponsibility`)

```
D型 = DR-1 〜 DR-4 の合計(4-20)
B型 = BR-1 〜 BR-4 の合計(4-20)
A型 = AR-1 〜 AR-4 の合計(4-20)

主責任感 = 最高スコア型
複合型 = 2位との差が3点未満なら複合型
```

### 3.5 G5: 組織毀損プロファイル(`computeOrgRisk`)

```
承認略奪型 = AG-1〜AG-3 の合計(3-15)
ルール暴力型 = RV-1〜RV-3 の合計
衝動暴走型 = IM-1〜IM-3 の合計

各カテゴリ:
  合計≥10 → high フラグ
  7-9    → medium フラグ
  3-6    → low(フラグなし)

★ 管理者向け内部出力のみ。本人画面には出さない。
```

### 3.6 G6: 12タイプ判定(`judgeType`)

判定優先順位:
1. **A凍結型 / A抑圧型**(G2 から最優先)
2. **本物の統合 / 偽の中庸**(G4 から)
3. **単独運転型**(top軸≥20 かつ 最低軸<10)
4. **主軸+副軸の組合せ**:
   - A+C → 突破型 / B+C → 共感型 / D+C → 設計型
   - B+D → 忠実型 / C+A → 直感型 / D+B → 分析型 / C+B → 蓄積型

12タイプ:
統合型 / 突破型 / 共感型 / 設計型 / 忠実型 / 直感型 / 分析型 / 蓄積型 / A抑圧型 / A凍結型 / 中庸偽装型 / 単独運転型

---

## 4. 第2層:回答メタ分析(2026-05-12 実装)

### 4.1 設計の動機

Likert 加点方式の弱点:
- **回答スタイルバイアス**: 2-4ばかり選ぶ人と1-5ばかりの人で同じ得点でも内的意味が違う
- **社会的望ましさバイアス**: 「自分はこうありたい」を答える傾向
- **同意傾向**: 4を選びがち(122人データで32.7%が4を選択)

これを**数値として補正・可視化**するのが第2層変数。
すべて `src/lib/scoring.ts` 内で計算され、`DiagnosticResult` に格納される。

### 4.2 Response Style Profile(`computeResponseStyle`)

全カテゴリ(axis / aSeparation / integration / responsibility / orgRisk)の Likert 値を集約し分析:

```typescript
type ResponseStyle =
  | "Modest"        // 穏当: 2-4が60%以上
  | "Discriminant"  // 識別: 1-5幅広く
  | "Extreme"       // 極端: 1か5が50%以上
  | "Neutral"       // 中立: 3が40%以上
  | "Acquiescence"  // 同意: 平均≥4.0
  | "Disacquiescence"; // 否定: 平均≤2.0

interface ResponseStyleProfile {
  style: ResponseStyle;
  distribution: { 1, 2, 3, 4, 5 };  // 各値の選択回数
  mean: number;
  sd: number;
  extremeRatio: number;     // 1か5の率
  neutralRatio: number;     // 3の率
  midRatio: number;         // 2か4の率
  acquiescenceBias: number; // mean - 3.0
  warnings: string[];       // 警告文(中立すぎる、極端すぎる、等)
}
```

**122人実証分布(参考)**:
- Modest 49% / Discriminant 28% / Extreme 18% / Neutral 4% / Acquiescence 1%

### 4.3 Neutral Frequency(`computeNeutralFrequency`)

```typescript
interface NeutralFrequencyV1 {
  count: number;     // 3を選んだ回数
  total: number;     // 全質問数
  ratio: number;     // count / total
  highFlag: boolean; // ratio > 0.30
}
```

`highFlag` が立つと「解離・無感覚の可能性、再診断推奨」のフラグになる。
v3.0 仕様書の Neutral Frequency 概念を Likert に継承。

### 4.4 軸間相関補正(`computeAxisCorrelationCorrection`)

**122人実証から得られた軸間相関**(全2440回答ベース):
```
      A     B     C     D
A    1.00  0.18 -0.01 -0.20
B    0.18  1.00 -0.18  0.08
C   -0.01 -0.18  1.00 +0.37  ← C-D 強相関
D   -0.20  0.08 +0.37  1.00
```

**補正式**(平均値 17 を基準にセンタリング):
```typescript
pureC = MEAN + (C - MEAN) - 0.37 * (D - MEAN)  // C から D共通成分を除去
pureD = MEAN + (D - MEAN) - 0.37 * (C - MEAN)
adjustedA = MEAN + (A - MEAN) * 1.10  // A-D 負相関を考慮
adjustedB = MEAN + (B - MEAN) * 1.09  // B-C 負相関を考慮
```

**意図**:
- 4軸は理論上「直交」だが、実証では C-D が強相関(賢さ次元として一緒に動く)
- 「真の C」「真の D」を分離して、個別性を見えやすくする
- 12タイプ判定の「C+D=設計型」と「D+C=分析型」の区別が C-D 相関で曖昧になる問題に対応

### 4.5 回答時間プロファイル(`computeResponseTimings`)

クライアント側(`apply/[token]/page.tsx`)で計測:
- 質問ごとに `Date.now()` 差分を記録
- セクション切替時に基準点をリセット
- 60秒以上は離脱・休憩とみなして上限60秒に丸める
- 最初の回答時のみ記録(後の修正は無視 = 最初の判断速度を保存)
- `ApplyDraft.responseTimings` で永続化(ブラウザを閉じても保持)

```typescript
interface ResponseTimings {
  perQuestion: Record<string, number>; // ms
  totalMs: number;
  meanMs: number;
  medianMs: number;
  longConsideredQuestions: string[]; // 中央値の2倍以上
  speedProfile: "即断型" | "通常" | "慎重型";
}

// speedProfile 判定:
//   中央値 < 3000ms → 即断型
//   中央値 > 12000ms → 慎重型
//   その他 → 通常
```

---

## 5. 第3層:AI個別分析(PersonalInsight)

### 5.1 設計の動機

静的テンプレ(TYPE_DESCRIPTIONS)では:
- 同じ「A抑圧型」と判定された人 → 全員同じ文章
- スコアの細かい違いや経歴の固有性が消える
- 「ピンと来ない・自分事化しない」問題が発生

### 5.2 入力

```typescript
interface PersonalInsightInput {
  type: QuadType;
  scores: AxisScores;
  emotions: EmotionScores;
  profile: { fullName, ageRange, gender, appliedPosition };
  career?: { education?, workHistory?, selfPR? };
  aSeparation?: { internal, external, classification, frozen };
  integration?: { observerScore, switchScore, index, status };
  responsibility?: { primary, isCompound, secondary? };
  responseStyle?: { style, mean, extremeRatio, neutralRatio, warnings };
  neutralFrequency?: { ratio, highFlag };
  correlationCorrection?: { pureC, pureD, adjustedA, adjustedB };
  timings?: { medianMs, speedProfile, longConsideredQuestions };
}
```

### 5.3 出力

```typescript
interface PersonalInsight {
  generatedAt: string;      // ISO timestamp
  modelVersion?: string;    // claude-sonnet-4-6 等
  headline: string;         // 一行サマリー
  summary: string;          // 150〜250字
  strengths: string[];      // 強み(個別根拠付き)
  cautions: string[];       // 注意点
  bestFitRoles: string[];   // 適合役割
  managementHint: string;   // 管理者向け
  growthDirection: string;  // 成長方向
}
```

### 5.4 プロンプトの設計原則(`src/lib/prompts.ts:PERSONAL_INSIGHT_SYSTEM`)

- 「A抑圧型は一般にバーンアウト高リスク」のような汎用記述は禁止
- 必ず数値(例: 内的A=14.6 vs 表出A=9.8)、Response Style(穏当/極端/中立)、経歴(具体的な職歴・自己PR)を文章に組み込む
- 第2層変数の警告(Neutral 30%超など)があれば必ず触れる
- 偽善的な賛美や過度に病理化する表現は避ける
- 出力は厳密に JSON 7フィールド(余計なコードブロックや前置きは禁止)

### 5.5 API エンドポイント

`POST /api/personal-insight`
- 入力: `PersonalInsightInput` JSON
- 処理: Claude(claude-sonnet-4-6)を一括呼び出し(非ストリーミング)
- 出力: `{ insight: PersonalInsight }` または `{ error: string }`
- JSON 抽出: コードフェンス対応、先頭/末尾の不要文字除去
- 必須フィールド検証: 7フィールド欠落で 502

### 5.6 キャッシュ

- 一度生成したら `applicant.diagnoses[i].personalInsight` に保存
- localStorage 永続化(applicant 全体経由)
- 再生成ボタンで上書き可能
- 別アプリケーションのキャッシュとは混ざらない(applicant ごと)

### 5.7 UI

`/admin/recruit/{id}` の **診断結果タブ下部**(`PersonalInsightSection`):
- 未生成: 「AIで個別分析を生成」ボタン + 説明文
- 生成中: スピナー
- 生成済み: 7フィールド表示 + 再生成ボタン + 生成日時表示
- エラー: 赤バナーでエラーメッセージ

---

## 6. データフロー全体

### 6.1 応募者→診断
```
1. /apply/{token} を開く
2. プロフィール / 経歴 / 履歴書PDF を入力(オプションで /api/parse-resume)
3. 75問 Likert に回答
   ・各問の回答時に Date.now() 差分を記録(第2層変数④)
   ・自動保存(localStorage に ApplyDraft として)
4. 5感情を1〜5で評価
5. 送信
   ・computeFullDiagnosis(answers, emotions, timingPerQuestion)
   ・scores / aSeparation / integration / responsibility / orgRisk / primaryType
     + responseStyle / neutralFrequency / correlationCorrection / timings
   ・Applicant として localStorage に保存(qm-demo-applicants キー)
   ・ApplyDraft はクリア
```

### 6.2 管理者→確認
```
1. /admin/recruit を開く → 応募者リスト
2. 応募者をクリック → /admin/recruit/{id}
3. タブ切替:
   ・概要: レーダー + タイプ + TypeInsight brief(静的テンプレ)
   ・経歴: 質問形式回答 / 履歴書解析結果 JSON
   ・診断結果:
     - 上部: レーダー + A/B/C/D スコア + 5感情
     - 中央: 診断詳細(G2/G3/G4/G5)+ 第2層変数(internal=true で表示)
     - 下部: ★AI個別分析セクション ── 生成ボタン → /api/personal-insight
   ・面接: AI 質問生成 + 面接記録 + メモ
   ・判定: 採用/不採用ボタン
```

---

## 7. 122人実証データから引いた経験的指針

`notes/2026-05-12-likert-120-empirical-analysis.md` の発見をプロダクトに反映している項目:

| 観察 | 値 | プロダクトへの反映 |
|---|---|---|
| Modest 49% / Extreme 18% | 回答スタイル分布 | Response Style Profile で自動分類 |
| C-D 相関 +0.37 | 軸間相関 | pureC / pureD の補正値計算 |
| A-D 相関 -0.20 | 軸間相関 | adjustedA の補正 |
| B-C 相関 -0.18 | 軸間相関 | adjustedB の補正 |
| C高=幸福+0.47, B高=不安+0.47 | 5感情との相関 | PersonalInsight プロンプトに織り込み(健全度) |
| C軸 SD=1.18(最弱) | 質問弁別力 | 課題として §9 に記載(C質問見直し) |
| 全体平均3.39(+0.39 同意傾向) | バイアス | acquiescenceBias で可視化 |

---

## 8. 互換性とアーカイブ

### 8.1 v3.0 強制選択式(差し戻し済み・アーカイブ)
- 仕様書: `docs/theory/pdfs/2026-05-12-master-spec.docx`
- 採点エンジン: `docs/theory/pdfs/2026-05-12-scoring-engine-v33.pdf`
- 採点キーDB: `docs/theory/scoring-db/quadmind-scoring-db-v3.{json,csv,sql}`
- 要約ノート: `notes/2026-05-12-scoring-engine-v3.md`
- 差し戻しコミット: `f34b2a0` / `74b1cda` / `eafb554`

**将来 v3.0 を再評価する条件**(候補):
- Likert で X人以上のデータ蓄積 + 強制選択式の中立(d)選択肢の設計改善
- 並走運用(Likert と強制選択式の両方に答えてもらう)= 重い
- 質問単位での切り替え(一部問のみ強制選択式)= 中間案

### 8.2 PersonalInsight 型の経緯
- 2026-05-12 一度実装 (`ca28f82`) → 設計者破綻で revert (`f34b2a0`)
- 2026-05-12 夜に復活(`1b86b5e`)── 第2層変数も入力に含めた形で
- いまの実装が **正しい姿**(diagnosis の信頼性を確保した上で個別化)

---

## 9. 残課題(優先順位順)

| # | 課題 | 担当 | 状態 |
|---|---|---|---|
| 1 | C軸質問の見直し(SD<1.2 の質問を再設計) | 飯淵 | 未着手 |
| 2 | G4 統合判定の中間ゾーン(指数15-20)を再設計 | 飯淵 + 内山 | 未着手 |
| 3 | 健全度指標表示(C高=健全、B高=不健全)を本人向け画面にも | 内山 | 未着手 |
| 4 | 第2層変数を採用判定に活用(管理ダッシュボードで重み付け) | 内山 | 未着手 |
| 5 | 強制選択式 v3.0 の中立(d)選択肢の理論的再検討 | 飯淵 | 未着手 |
| 6 | 複数回受診の時系列追跡(状態依存型 vs 特性固定型の判別) | 内山 | 未着手 |
| 7 | 対話型ヒアリング(AI が回答パターンを見て追加質問) | 内山 | 検討段階 |
| 8 | 4軸独立前提を仕様書で明示的に緩めるかどうか | 飯淵 | 未着手 |

---

## 10. ディレクトリ構成(現行コードのマップ)

```
new-project/
├── src/
│   ├── app/
│   │   ├── apply/[token]/page.tsx        ── 応募フォーム(自動保存+回答時間計測)
│   │   ├── admin/
│   │   │   ├── recruit/
│   │   │   │   ├── page.tsx              ── 応募者一覧
│   │   │   │   └── [id]/page.tsx         ── 応募者詳細(★AI個別分析含む)
│   │   │   └── manage/                   ── 社員管理(採用後)
│   │   └── api/
│   │       ├── personal-insight/route.ts ── ★AI個別分析API
│   │       ├── report/route.ts           ── 自己分析/マネジメントガイド生成
│   │       ├── compare/route.ts          ── 1年後比較
│   │       ├── interview-questions/route.ts
│   │       ├── oneonone-suggest/route.ts
│   │       └── parse-resume/route.ts
│   ├── components/
│   │   ├── TypeInsight.tsx               ── 静的テンプレ表示(概要タブで使用)
│   │   ├── DiagnosticInsight.tsx         ── G2/G3/G4/G5 + 第2層変数表示
│   │   ├── RadarChart.tsx
│   │   ├── EmotionBars.tsx
│   │   └── ScoreTable.tsx
│   ├── lib/
│   │   ├── types.ts                      ── 型定義(PersonalInsight 含む)
│   │   ├── questions.ts                  ── 75問体系定義
│   │   ├── scoring.ts                    ── 第1層+第2層 採点ロジック
│   │   ├── prompts.ts                    ── AI プロンプト(server-only)
│   │   ├── anthropic.ts                  ── Claude SDK ファクトリ
│   │   └── store.ts                      ── localStorage アクセサ
│   └── data/
│       ├── applicants.ts                 ── seed 応募者(デモ用)
│       ├── employees.ts                  ── seed 社員 + 1on1
│       ├── settings.ts                   ── デフォルト設定
│       └── typeDescriptions.ts           ── TYPE_DESCRIPTIONS(静的テンプレ)
└── docs/theory/
    ├── INDEX.md                          ── 全資料の索引
    ├── notes/
    │   ├── 2026-05-12-current-spec-v1-likert.md ── ★本ドキュメント(現行仕様)
    │   ├── 2026-05-11-diagnostic-spec-v1.md     ── v1.0 理論仕様
    │   ├── 2026-05-12-likert-120-empirical-analysis.md ── 122人実証分析
    │   ├── 2026-05-12-session-log-decisions.md  ── 決定の経緯
    │   ├── 2026-05-12-iibuchi-action-items.md   ── 飯淵さんへの課題
    │   ├── 2026-05-12-scoring-engine-v3.md      ── v3 アーカイブ
    │   └── ... (理論ノート群)
    ├── pdfs/
    │   ├── 2026-05-XX-diagnostic-spec-v1.pdf    ── v1.0 原本
    │   ├── 2026-05-12-master-spec.docx          ── v3.0 原本(アーカイブ)
    │   └── 2026-05-12-scoring-engine-v33.pdf    ── v3.0 採点エンジン(アーカイブ)
    └── scoring-db/
        ├── 2026-05-12-likert-120-respondents.xlsx ── 122人 生データ
        └── quadmind-scoring-db-v3.{json,csv,sql} ── v3.0 採点キーDB(アーカイブ)
```

---

## 11. 一行で締める

> **「飯淵さんの v1.0 理論を本流に、v3.0 の概念は第2層変数として翻訳し、AI で個別化を加える」── これがいま動いている設計のすべて。**

次の主アクションは **§9 の #1(C軸質問の見直し)** で、これは飯淵さん側のターン。
プロダクト側の自由度が必要な作業(健全度指標表示・採用判定への活用)は内山さんがいつでも進められる。
