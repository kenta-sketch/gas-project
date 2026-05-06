# Quad Mind 理論ナレッジ INDEX

このフォルダはクアッドマインド理論プロジェクトに関する全資料の索引。
材料が来たらここに1行追加し、本体は適切なサブフォルダへ。

最終更新: 2026-05-05

---

## フォルダ構成

| パス | 用途 |
|---|---|
| `master-structure.md` | プロジェクト全体構造図(随時更新) |
| `demo-spec-v1.md` | デモ画面開発仕様 v1 |
| `llm-prompts-v1.md` | レポート生成LLMプロンプト草案 v1 |
| `pdfs/` | 原本PDF(理論書・サンプル等) |
| `slides/` | スライド資料(.pptx 等) |
| `notes/` | テキスト断片・友人発話・追加情報の整理ノート |
| `voice/` | 音声書き起こし(健太さん発話含む) |

---

## 4階層との対応

材料を分類する時の基準(マスター構造図 セクション2 参照):

- **理論基盤層** → `pdfs/quad-mind-*` `pdfs/quad-vision-*` `pdfs/love-*`
- **戦略層** → `notes/brain-juice-*` `voice/kenta-*-era-theory.md`
- **診断層** → `notes/three-types-*` `notes/iq-eq-*` `notes/q1-q9-*`
- **操作層** → `pdfs/*-sample.pdf` `slides/brainjuice-v3.pptx`

---

## 受信ログ(時系列)

### 2026-05-01

- ✅ `master-structure.md` ── マスター構造図(健太さん経由・AI整理版)
- ✅ `demo-spec-v1.md` ── デモ画面開発仕様 v1
- ✅ `llm-prompts-v1.md` ── LLMプロンプト草案 v1

### TODO 受信予定(マスター構造図セクション10より)

`pdfs/` に追加予定:
- [ ] `quad-mind-theory.pdf` ── クワッドマインド理論PDF(友人提供)
- [ ] `quad-vision-theory.pdf` ── クワッドビジョン理論PDF
- [ ] `love-philosophy.pdf` ── 愛の哲学PDF
- [ ] `self-analysis-sample.pdf` ── 自己分析レポートサンプル(出力品質ベンチマーク)
- [ ] `management-guide-sample.pdf` ── マネジメントガイドサンプル(出力品質ベンチマーク)

`slides/` に追加予定:
- [ ] `brainjuice-v3.pptx` ── BRAIN JUICEスライド v3

`notes/` に追加予定:
- [ ] `2026-04-XX-three-types.md` ── 3タイプ理論的分解(友人作成)
- [ ] `2026-04-XX-iq-eq-mapping.md` ── IQ/EQ翻訳装置
- [ ] `2026-04-XX-q1-q9.md` ── 質問群Q1〜Q9(友人作成)
- [ ] `2026-04-XX-brain-juice-essay.md` ── BRAIN JUICEエッセイ10章

`voice/` に追加予定:
- [ ] `kenta-os-v3.md` ── 健太さんOS v3.0
- [ ] `kenta-time-theory.md` ── 健太さんボイス(時代論)
- [ ] `kenta-3axis-vision.md` ── 採用システム3軸ビジョン

---

## 運用ルール

1. **材料が来たらチャットに投げる** ── 健太さんがこのスレッドに投稿
2. **私(Claude)が分類保存** ── 適切なフォルダ + 命名規則で保存
3. **INDEX.md に1行追加** ── 受信ログに日付付きで記録
4. **コミット & プッシュ** ── 自動でアーカイブされる

### 命名規則

- `notes/`: `YYYY-MM-DD-{slug}.md`(例: `2026-05-01-three-types.md`)
- `voice/`: `YYYY-MM-DD-{topic}.md`
- `pdfs/`: 内容を表す英語slug.pdf(例: `quad-mind-theory.pdf`)
- `slides/`: 同上

### YAML フロントマター(notes / voice 用)

```yaml
---
title: 3タイプ理論的分解
source: 友人作成(2026-04-XX 受信)
layer: 診断層
status: 受領済 / 検討中 / 確定
related:
  - master-structure.md (セクション2 診断層)
---
```
