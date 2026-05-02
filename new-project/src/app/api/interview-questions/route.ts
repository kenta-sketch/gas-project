import { NextRequest } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import type { AxisScores, EmotionScores, QuadType, StageId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReqBody {
  applicantName: string;
  appliedPosition: string;
  stage: StageId;
  scores?: AxisScores;
  emotions?: EmotionScores;
  type?: QuadType;
  previousNotes?: string;
}

const SYSTEM = `あなたはクアッドマインド理論をベースに、面接官に対して深掘り質問を提案する専門アシスタントです。

【クアッドマインド理論の前提】
- A: 動物的感情(感受性・即時の反応・共感)
- B: 機械的感情(承認・羞恥・社会的同調)
- C: 動物的理性(直感・経験圧縮・非言語的判断)
- D: 機械的理性(論理・分析・計画・説明)

【目的】
応募者の診断スコアと過去の面接メモから、「次の面接でこそ確認すべき」深掘り質問を5つ提案する。
- 応募者の主エンジンに対し、過剰に出ている時のリスクを引き出す質問
- 応募者の弱い軸が、現職場で必要な場面で機能するかを確認する質問
- ★整合性チェック: 履歴書/質問回答と診断結果の食い違いを引き出す質問

【出力形式】
- 番号付き箇条書きで5つ
- 各質問は1文で簡潔に
- 質問の意図を () で添える
- 余計な前置きは書かない、いきなり1.から始める`;

function fmtScores(s?: AxisScores): string {
  if (!s) return "(未診断)";
  return `A:${s.A}/25 B:${s.B}/25 C:${s.C}/25 D:${s.D}/25`;
}

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

  const userMsg = `応募者: ${body.applicantName}
応募職種: ${body.appliedPosition}
現在のステージ: ${body.stage}
診断スコア: ${fmtScores(body.scores)}
タイプ: ${body.type ?? "(未診断)"}
過去の面接メモ:
${body.previousNotes || "(なし)"}

次の面接で使う深掘り質問を5つ提案してください。`;

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
