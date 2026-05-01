import { NextRequest } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import {
  SELF_REPORT_SYSTEM,
  selfReportUser,
  MANAGER_GUIDE_SYSTEM,
  managerGuideUser,
} from "@/lib/prompts";
import type { AxisScores, EmotionScores } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReqBody {
  kind: "self" | "manager";
  ageRange: string;
  gender: string;
  position: string;
  scores: AxisScores;
  emotions: EmotionScores;
}

export async function POST(req: NextRequest) {
  let body: ReqBody;
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { kind, ageRange, gender, position, scores, emotions } = body;

  if (!["self", "manager"].includes(kind)) {
    return new Response("invalid kind", { status: 400 });
  }

  const system =
    kind === "self" ? SELF_REPORT_SYSTEM : MANAGER_GUIDE_SYSTEM;
  const userMsg =
    kind === "self"
      ? selfReportUser({ ageRange, gender, position, scores, emotions })
      : managerGuideUser({ ageRange, gender, position, scores, emotions });

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
          max_tokens: 4000,
          temperature: 0.7,
          system,
          messages: [{ role: "user", content: userMsg }],
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
