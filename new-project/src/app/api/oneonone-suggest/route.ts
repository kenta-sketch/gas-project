import { NextRequest } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import type { AxisScores, EmotionScores, QuadType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReqBody {
  employeeName: string;
  role: string;
  type: QuadType;
  scores: AxisScores;
  emotions: EmotionScores;
  recentNotes?: string;
}

const SYSTEM = `あなたはクアッドマインド理論をベースに、上司向けに次回1on1のテーマと進め方を提案するアシスタントです。

【クアッドマインド理論の前提】
- A: 動物的感情(感受性・即時の反応)
- B: 機械的感情(承認・社会的同調)
- C: 動物的理性(直感・経験圧縮)
- D: 機械的理性(論理・計画)

【出力形式 (Markdown)】
## 推奨テーマ(3つ)
1. テーマ名 — 1行説明 + (どの軸に作用するか)
2. ...
3. ...

## 進め方のヒント
- 開始の問いかけ例(2つ)
- 避けたい関わり方(1〜2つ)

## 観察ポイント
- 3つ程度

簡潔に。全体で500字以内。冗長な前置きは書かない。`;

export async function POST(req: NextRequest) {
  let body: ReqBody;
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  let client;
  try {
    client = getAnthropic();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message, hint: ".env.local に ANTHROPIC_API_KEY を設定" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const userMsg = `社員: ${body.employeeName}
役割: ${body.role}
タイプ: ${body.type}
最新スコア: A:${body.scores.A}/25 B:${body.scores.B}/25 C:${body.scores.C}/25 D:${body.scores.D}/25
最新の感情: 不安${body.emotions.fear}/悲しみ${body.emotions.sadness}/怒り${body.emotions.anger}/喜び${body.emotions.joy}/幸福${body.emotions.happiness}

直近の1on1メモ:
${body.recentNotes || "(なし)"}

次回1on1のテーマと進め方を提案してください。`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          temperature: 0.7,
          system: SYSTEM,
          messages: [{ role: "user", content: userMsg }],
        });
        for await (const evt of response) {
          if (evt.type === "content_block_delta" && evt.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(evt.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode("\n\n[エラー: " + (err as Error).message + "]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
