# Quad Mind Demo (v1)

クアッドマインド理論ベースのHRプラットフォーム ── 採用フェーズ デモ

> 友人(理論作者)に「自分の理論がツールとしてこう見える」のイメージ参照点を提供する可視化デモ。完成度より「絵があること」を優先。Option B(採用1人の入口→出口 + 同じ人物の1年後時系列)を実装。

## 5画面構成

1. **/** ── ホーム / 候補者選択(3名のダミー候補者: D優位/A優位/B優位)
2. **/diagnose** ── Q1〜Q9 + 5感情の入力(プリセット回答が初期表示)
3. **/result** ── A/B/C/Dレーダー + 5感情バー + タイプ判定 + 適合度判定
4. **/report** ── 自己分析レポート / マネジメントガイド(タブ切替・LLMストリーミング)
5. **/compare** ── 1年後比較(重ね合わせレーダー + LLMによる変化解釈と配置提案)

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local の ANTHROPIC_API_KEY に実キーを設定
npm run dev
```

開発サーバ: http://localhost:3000

### 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✓ | Claude API キー(レポート生成用) |
| `ANTHROPIC_MODEL` | | 使用モデル(既定: `claude-sonnet-4-6`) |

## デプロイ(Vercel)

```bash
npm install -g vercel
vercel
# Project Settings → Environment Variables で ANTHROPIC_API_KEY を登録
vercel --prod
```

URLが発行されるので友人に共有可能。

## ディレクトリ構成

```
src/
├─ app/
│  ├─ page.tsx               # 画面1: ホーム
│  ├─ diagnose/page.tsx      # 画面2: 質問入力
│  ├─ result/page.tsx        # 画面3: スコア結果
│  ├─ report/page.tsx        # 画面4: レポート(タブ切替)
│  ├─ compare/page.tsx       # 画面5: 1年後比較
│  └─ api/
│     ├─ report/route.ts     # 自己分析/マネジメントガイド生成API
│     └─ compare/route.ts    # 1年後変化解釈API
├─ components/
│  ├─ RadarChart.tsx         # A/B/C/Dレーダー (recharts)
│  ├─ EmotionBars.tsx        # 5感情バー
│  └─ ScoreTable.tsx         # 軸別スコア表
├─ lib/
│  ├─ types.ts               # 型定義 / 軸ラベル
│  ├─ questions.ts           # Q1〜Q9 + 5感情質問
│  ├─ scoring.ts             # スコア計算 / タイプ判定 / 1年後差分パターン
│  ├─ store.ts               # sessionStorage ベースのデモ用 state
│  ├─ anthropic.ts           # Claude SDK ファクトリ (server-only)
│  └─ prompts.ts             # ★L3理論機構★ プロンプト本体 (server-only)
└─ data/
   └─ candidates.ts          # ダミー候補者3名(採用時+1年後)
```

## 設計原則

### IP保護(L3理論機構)
- スコア計算式・タイプ判定・LLMプロンプト本体はすべてサーバー側 (`server-only` ガード)
- クライアントには結果のみが流れ、プロンプト本体は流出しない
- 将来的にレート制限・監査ログを `/api/*` 配下で一元的に追加可能

### 出力の二重構造
- `/api/report` の `kind` パラメータで `self` / `manager` を切り替え
- 同一データから「本人用(地図トーン)」と「管理者用(操作的トーン)」を生成
- システムプロンプトを完全に分離(`SELF_REPORT_SYSTEM` / `MANAGER_GUIDE_SYSTEM`)

### ストリーミング表示
- `messages.stream` でChunkが届くたびにUIを更新(待ち時間体感の改善)
- レポート途中段階でも内容が見え始める

## デモシナリオ(5分)

1. ホームで「佐藤 一郎」を選び「採用時シナリオで診断」
2. プリセット回答(D偏重)を確認 → 「結果を見る」
3. **理詰め型** が表示される。営業職への適合度は **条件付き適合**(D優位の典型反応)
4. 「レポートを生成 →」で自己分析/マネジメントガイドの両方を見る
5. ホームに戻り、同じ「佐藤 一郎」で **1年後シナリオで診断** → 結果画面
6. **タイプが混合型に変化**(統合方向への適応)、「1年後の変化を見る」で重ね合わせレーダー + LLM変化解釈を表示

## 本番でデモから追加されるもの

セキュリティ/運用関連は本番設計時に追加(マスター構造図セクション5参照):

- 認証認可(SSO / SAML / OIDC)
- データベース(PostgreSQL等)
- データ暗号化(保存時 + 通信時)
- 監査ログ
- ロールベース権限制御(本人 / 上長 / 人事 / 役員)
- レート制限
- 履歴書アップロード + 解析(v1範囲外)
- 面接質問提案 + 整合性チェック(本丸機能、v1範囲外)

## スクリプト

```bash
npm run dev         # 開発サーバ
npm run build       # プロダクションビルド
npm start           # ビルド成果物の起動
npm run typecheck   # 型チェック
npm run lint        # ESLint
```
