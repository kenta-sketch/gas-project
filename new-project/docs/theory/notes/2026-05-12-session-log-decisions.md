---
title: 2026-05-12 セッションログ ── v3.0 受領から差し戻し、第2層変数実装まで
source: 内山健太 × Claude(共同設計セッション、飯淵賢男の意見も随時反映)
layer: 診断層 / プロジェクト意思決定
status: 確定
related:
  - notes/2026-05-12-scoring-engine-v3.md
  - notes/2026-05-12-likert-120-empirical-analysis.md
  - notes/2026-05-11-diagnostic-spec-v1.md
---

# 2026-05-12 セッションログ ── 設計判断の経緯

このドキュメントは、2026-05-12 の長時間セッションで内山健太・飯淵賢男・Claude の三者で行った議論の経緯と、最終的な設計判断の根拠を時系列で残すもの。
将来「なぜこの構造で実装したのか」を再現可能にするための記録。

---

## 0. このセッションの始点

朝の時点で `claude/test-functionality-boVMQ` ブランチには:
- v1.0 Likert(75問体系・12タイプ判定)が `67c05bb` で実装済み
- master が `2a264dc` のままで PR#2 (`#2 = 67c05bb`) が master にマージ済み
- preview Vercel(`new-project-nu-orcin.vercel.app`)で動作中
- `/apply/demo` に **クライアントエラー** が発生中(原因未調査)

---

## 1. 経緯(時系列)

### 1.1 React Hooks 違反の発見と修正
- `/apply/demo` を開いた時の "Application error: a client-side exception" を調査
- 原因: `useMemo` を `if (!settings) return ...` の早期 return の **後** で呼んでいた
- 修正: `sectionQuestionsExtended` の useMemo を早期 return の前に移動
- → **コミット `45f203a`**

### 1.2 採点エンジン v3.0(強制選択式)の受領
- 飯淵さんから Google Drive 「５月１２日共有」フォルダ(`1Zge5ceR6S-5ZsqVIjDWeDyEYWLYS1yTj`)で 5 ファイル受領:
  - `QuadMind 完全統合仕様書 Master.docx`
  - `quadmind scoring engine v33.pdf`
  - `quadmind scoring db v3.json / .csv / .sql`(288行 = 72問 × 4選択肢)
- 大幅な設計変更: Likert 5段階 → 強制選択式 4択、3スコア方式、マトリクス採点、3キー方式
- ファイルを `docs/theory/pdfs/` と `docs/theory/scoring-db/` に保存
- 要約ノートを `notes/2026-05-12-scoring-engine-v3.md` に作成
- → **コミット `3b1b728`**

### 1.3 v3.0 を本実装(Phase 1-4 一気に)
- ユーザー判断「フル個別化、全部実装」
- 5ファイル変更(1440行追加、290行削除):
  - `src/data/scoring-db-v3.ts`(新規・採点キーDB)
  - `src/lib/types.ts`(LikertValue → OptionId)
  - `src/lib/questions.ts`(全72問を4選択肢化)
  - `src/lib/scoring.ts`(3スコア方式に書き換え)
  - `src/app/apply/[token]/page.tsx`(5択UI → 4択UI)
- typecheck/build パス確認
- → **コミット `7a23161`**

### 1.4 応募フォームの自動保存(localStorage ドラフト)
- ユーザー要望「入力項目が多いから通信切断や離脱で続きから再開できるように」
- localStorage に `qm-apply-draft-{token}` キーで全フィールド保存
- 復元バナー、保存インジケータ、リセットボタン
- → **コミット `7726d5a`**

### 1.5 設計者本人(内山・飯淵)のテスト結果が機能していないことが判明
- 内山さんの v3.0 結果: A=0、B=1.3、C=3.9、D=10.5(全軸異常に低い)
  - タイプ判定は A抑圧型 だが、根拠が薄い
  - 「中立(d)」を冷静に選びすぎた結果と推測
- 飯淵さんの v3.0 結果: C=17.1(C主軸)・Switch=25 満点・iA=0
  - タイプ判定は 直感型 (経歴と整合)
  - しかし統合判定が「単独運転」(統合指数 17.7 は中間ゾーンに落ちる)
  - iA=0 は「熱意・鼓舞」と経歴が矛盾 → 「冷静に問われた時に内側のAを認識しない」癖
- 静的テンプレで「A抑圧型」の文章を見て、内山さんが「ピンと来ない・自分事化しない」と発言

### 1.6 PersonalInsight(個別化レポート)の提案と着手
- 「経歴 × 診断結果を AI が個別化して生成」する `/api/personal-insight` を設計
- `types.ts` に `PersonalInsight` 型を追加(後で revert)
- → **コミット `ca28f82`**

### 1.7 サンプル個別化を内山さん・飯淵さんで実演
- 内山さん専用 PersonalInsight をその場で執筆 → ピンと来ない反応
- 飯淵さん専用 PersonalInsight をその場で執筆 → 経歴とスコアが整合する分、内山さんよりは響くが、まだ違和感

### 1.8 内山さんからの根本的な問い
> 「結局、この5段階のほうがいいの？もとの質問に対する回答方式のほうがいいの？」
> 「2-4型と1-5型でブレるという友人の懸念がある」
> 「Response Style や回答時間を変数化する案」

### 1.9 ★ 120人 Likert データの発見
- 内山さんが共有: Google フォーム「クアットマインド理論 診断結果.xlsx」
- 122人の生回答が蓄積されていた(v1.0 Likert 形式)
- Drive ID: `1HitbFSjsyM23wvd3y4DQ1_bVbPK7hD8V`
- 性別/年齢/職業 + 20問 Likert(5段階)+ 5感情 + MBTI自己申告

### 1.10 122人実証分析の実行
- xlsx を pandas で解析、主要な発見:
  - **回答スタイル分布**: Modest 49%、Discriminant 28%、Extreme 18%、Neutral 4%、Acquiescence 1%
  - **回答分布**: 1=7.9%、2=21.4%、3=16.4%、**4=32.7%**(最多)、5=21.5%
  - **全体平均 3.39**(中央3より +0.39 = 同意傾向)
  - **軸間相関**: C-D = **+0.37**(強相関)、A-D = -0.20、B-C = -0.18、A-B = +0.18
  - **5感情と軸の相関**: C高 = 幸福+0.47 / 不安-0.39(超健全)、B高 = 不安+0.47 / 不幸-0.30(不健全)
  - **質問の弁別力**: C軸 SD=1.18(最弱)、特に「危険を直感で回避」SD=1.02 が最弱
- 詳細は `notes/2026-05-12-likert-120-empirical-analysis.md`

### 1.11 ★★ 決断: v3.0 差し戻し、v1.0 継続採用
- Claude の提案: 「現段階では Likert v1.0 + Response Style 変数化 がベスト」
- 根拠:
  1. **データが既にある**(120人実証済み vs v3.0 はゼロ)
  2. **設計者2人で破綻している**(冷静に問うと中立になる構造問題)
  3. **飯淵さんの懸念は変数化で解消可能**(Response Style 第2層で吸収)
- 内山さんが飯淵さんと現地で議論し、同意取得 → 「1でいこう!」

### 1.12 v3.0 関連コミットの revert
- 以下を `git revert` で差し戻し:
  - `ca28f82` PersonalInsight 型追加 → **コミット `f34b2a0`**
  - `7726d5a` 自動保存(v3 ベース) → **コミット `74b1cda`**
  - `7a23161` 採点エンジン v3.0 実装 → **コミット `eafb554`**
- ★ ただし `3b1b728`(v3 仕様書・採点キーDB を docs/theory/ に保存)は **維持**
- 自動保存機能は v1.0 Likert コードベース上に **再実装**
- 120人分析結果と決定文書を `notes/2026-05-12-likert-120-empirical-analysis.md` に保存
- → **コミット `f0d38c7`**

### 1.13 第2層変数の実装
- 内山さん「第2層変数も含めて実装してほしい」「経緯もログで git に乗せて」
- 以下を実装:
  - **types.ts**: `ResponseStyleProfile` / `NeutralFrequencyV1` / `AxisCorrelationCorrection` / `ResponseTimings`
  - **scoring.ts**: `computeResponseStyle` / `computeNeutralFrequency` / `computeAxisCorrelationCorrection` / `computeResponseTimings`
  - **apply page**: 質問ごとの `Date.now()` 計測ロジック、ApplyDraft への保存
  - **DiagnosticInsight**: 第2層変数の表示(管理者向け internal=true のみ)
- このセッションログ自体を `notes/2026-05-12-session-log-decisions.md` として保存
- → 本コミット

---

## 2. 最終的な意思決定リスト(改めて)

| # | 決定事項 | 根拠 |
|---|---|---|
| 1 | **v1.0 Likert を本流維持** | 122人実証データ済み・設計者で機能 |
| 2 | **v3.0 強制選択式コードは差し戻し、仕様書・DBは保存** | コードは機能しなかったが理論的価値はあり |
| 3 | **Response Style Profile を第2層変数として実装** | 122人分析で Modest 49%・Extreme 18% と明確 |
| 4 | **Neutral Frequency を独立指標として実装** | v3.0仕様書の概念をLikertに継承、30%超でフラグ |
| 5 | **軸間相関補正を実装** | C-D=0.37、A-D=-0.20 などの実証値を反映 |
| 6 | **回答時間ロギングを実装** | 慎重型/即断型/長考点の判別、C軸弁別力不足の補完 |
| 7 | **第2層変数は管理者向け(internal)のみ表示** | 本人向けは混乱を避けるためメイン軸スコアとタイプに集中 |
| 8 | **自動保存(localStorage)は維持** | 入力項目が多く離脱時の救済が必須 |
| 9 | **PersonalInsight(個別化レポート)は保留** | 採点側の信頼性確保が先、AI 個別化はその後 |
| 10 | **C軸質問の見直し**(まだ未実施) | 飯淵さんと協議のうえ、SD<1.15 の質問を再設計 |

---

## 3. 実装した第2層変数の仕様

### 3.1 Response Style Profile
```typescript
type ResponseStyle =
  | "Modest"        // 穏当: 2-4が60%以上
  | "Discriminant"  // 識別: 1-5幅広く使う
  | "Extreme"       // 極端: 1か5が50%以上
  | "Neutral"       // 中立: 3が40%以上
  | "Acquiescence"  // 同意: 平均≥4.0
  | "Disacquiescence"; // 否定: 平均≤2.0

interface ResponseStyleProfile {
  style: ResponseStyle;
  distribution: { 1, 2, 3, 4, 5 }; // 各値を選んだ回数
  mean: number;
  sd: number;
  extremeRatio: number;
  neutralRatio: number;
  midRatio: number;
  acquiescenceBias: number; // mean - 3.0
  warnings: string[]; // 注意フラグ
}
```

### 3.2 Neutral Frequency
```typescript
interface NeutralFrequencyV1 {
  count: number;     // 3を選んだ回数
  total: number;     // 全質問数
  ratio: number;     // 比率
  highFlag: boolean; // >30%
}
```

### 3.3 Axis Correlation Correction
```typescript
// 122人実証相関:
// C-D = +0.37, A-D = -0.20, B-C = -0.18, A-B = +0.18

interface AxisCorrelationCorrection {
  pureC: number;     // C - 0.37 * (D-17)
  pureD: number;     // D - 0.37 * (C-17)
  adjustedA: number; // A の影響度を補正
  adjustedB: number;
  notes: string[];
}
```

### 3.4 Response Timings
```typescript
interface ResponseTimings {
  perQuestion: Record<string, number>; // ms
  totalMs: number;
  meanMs: number;
  medianMs: number;
  longConsideredQuestions: string[]; // 中央値の2倍以上
  speedProfile: "即断型" | "通常" | "慎重型";
}
```

### 3.5 計時ロジック(apply page)
- セクション開始時 `sectionEntryTimeRef = Date.now()`
- 質問への最初の回答時 `elapsed = Date.now() - (lastClickTimeRef ?? sectionEntryTime)`
- 上限60秒(離脱・休憩は除外)
- 一度記録した質問は再回答しても上書きしない(最初の判断速度を保存)
- `ApplyDraft.responseTimings` で永続化、ブラウザを閉じても保持

---

## 4. 次のセッションで考えること(未対応事項)

### 4.1 すぐやれること
- [ ] **C軸質問の見直し**(SD=1.18 が最弱、特に「危険を直感で回避」SD=1.02)
- [ ] **健全度指標表示**(C高=健全、B高=不健全の実証相関を本人向け画面にも反映)
- [ ] **管理ダッシュボードでの第2層変数活用**(タイプ判定の補正に使う、または採用判定の補助)

### 4.2 中期で検討
- [ ] **PersonalInsight 復活**(`/api/personal-insight`)を **第2層変数も入力として**実装
  - 同じ A抑圧型 でも Response Style や Neutral Frequency が違えば文章が変わる構造
- [ ] **C軸補正の重み付け改善**(現状は単純な線形補正、123人データから多変量回帰すべき)
- [ ] **複数回受診の時系列追跡**(v3 仕様書の "状態依存型 vs 特性固定型" の判別)

### 4.3 長期で検討
- [ ] **v3.0 強制選択式を別質問群として並走**(理論検証用、データ蓄積後に Likert と比較)
- [ ] **回答時間 × 質問内容のヒートマップ**(どの質問で揺れるか可視化)
- [ ] **対話型ヒアリング**(AI が回答パターンを見て追加質問)

---

## 5. 設計上の教訓(Lessons Learned)

1. **「理論的に正しい」より「データで検証できる」を優先**
   v3.0 強制選択式は理論的に Likert より優れているが、122人データの蓄積に追いつくのに何ヶ月もかかる。「Likert + 変数化」は妥協ではなく、データ駆動の現実解。

2. **設計者自身でテストして破綻するなら、それは深刻なシグナル**
   内山・飯淵の v3.0 結果が機能しなかった時点で、「みんな同じことが起きる」可能性が高い。一般ユーザーで試す前に気付けた。

3. **静的テンプレの限界は AI 個別化で解決すべきだが、その前に採点側の信頼性が要る**
   PersonalInsight を v3.0 のスコアで生成しても、入力(スコア)が信頼できなければ出力も信頼できない。順序: 採点の信頼性 → 個別化 AI。

4. **既存データの発見は設計判断を一変させる**
   122人データは「忘れていた資産」だった。新規実装に時間を使う前に、まず手元の資産を棚卸しすべき。

5. **revert は退却ではなく、より良い前進のための整理**
   v3.0 を捨てたのではなく、適切な場所(docs/theory/)に保存し、コードは v1.0 に戻した。将来データが揃ったら v3.0 を再評価できる。

---

## 6. このセッションのコミット一覧

| ハッシュ | 内容 |
|---|---|
| `45f203a` | fix: React Hooks 違反の修正 |
| `3b1b728` | docs: 採点エンジン v3.0 仕様書を `docs/theory/` に保存 |
| `7a23161` | feat: 採点エンジン v3.0 を実装 (後に revert) |
| `7726d5a` | feat: 応募フォームに自動保存機能 (後に revert) |
| `ca28f82` | feat: PersonalInsight 型を追加 (後に revert) |
| `f34b2a0` | revert: ca28f82 を差し戻し |
| `74b1cda` | revert: 7726d5a を差し戻し |
| `eafb554` | revert: 7a23161 を差し戻し |
| `f0d38c7` | docs+feat: 122人実証分析を保存 + 自動保存を v1.0 に再実装 |
| **本コミット** | feat+docs: 第2層変数(4種)の実装 + セッションログ保存 |
