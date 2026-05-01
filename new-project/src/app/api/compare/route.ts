import { NextRequest } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import { COMPARE_SYSTEM, compareUser } from "@/lib/prompts";
import type { AxisScores, QuadType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReqBody {
  name: string;
  ageRange: string;
  gender: string;
  roleAtHire: string;
  currentRole: string;
  scoresT1: AxisScores;
  scoresT2: AxisScores;
  typeT1: QuadType;
  typeT2: QuadType;
  dateT1: string;
  dateT2: string;
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
      JSON.stringify({
        error: (e as Error).message,
        hint: ".env.local に ANTHROPIC_API_KEY を設定してください",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          temperature: 0.7,
          system: COMPARE_SYSTEM,
          messages: [{ role: "user", content: compareUser(body) }],
        });
        for await (const evt of response) {
          if (
            evt.type === "content_block_delta" &&
            evt.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(evt.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            "\n\n[エラー: " + (err as Error).message + "]",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
