import { NextRequest } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import {
  PERSONAL_INSIGHT_SYSTEM,
  personalInsightUser,
  type PersonalInsightInput,
} from "@/lib/prompts";
import type { PersonalInsight } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * AI個別分析 API
 * 診断結果 + 経歴 + 第2層変数 を Claude に渡して、その個人専用の
 * 分析(TYPE_DESCRIPTIONS と同じ7フィールド)を JSON で返す。
 *
 * リクエスト: PersonalInsightInput
 * レスポンス: { insight: PersonalInsight } か { error: string }
 */
export async function POST(req: NextRequest) {
  let input: PersonalInsightInput;
  try {
    input = (await req.json()) as PersonalInsightInput;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!input.type || !input.scores || !input.profile?.fullName) {
    return new Response(JSON.stringify({ error: "Missing required fields (type / scores / profile.fullName)" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  let client;
  try {
    client = getAnthropic();
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: (e as Error).message,
        hint: ".env.local または Vercel 環境変数に ANTHROPIC_API_KEY を設定してください",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const userMsg = personalInsightUser(input);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      temperature: 0.7,
      system: PERSONAL_INSIGHT_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    });

    // text content を集約
    const text = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("")
      .trim();

    // JSON ブロックを抽出(コードフェンス内に入っているケースを救う)
    let jsonStr = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    // 先頭が { でない場合、最初の { から最後の } までを抽出
    if (!jsonStr.startsWith("{")) {
      const start = jsonStr.indexOf("{");
      const end = jsonStr.lastIndexOf("}");
      if (start >= 0 && end > start) jsonStr = jsonStr.slice(start, end + 1);
    }

    let parsed: Partial<PersonalInsight>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Claude response was not valid JSON",
          detail: (e as Error).message,
          raw: text.slice(0, 800),
        }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }

    // 必須フィールドの検証
    const required: (keyof PersonalInsight)[] = [
      "headline",
      "summary",
      "strengths",
      "cautions",
      "bestFitRoles",
      "managementHint",
      "growthDirection",
    ];
    const missing = required.filter((k) => parsed[k] === undefined || parsed[k] === null);
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          error: "AI response missing required fields",
          missing,
          raw: text.slice(0, 800),
        }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }

    const insight: PersonalInsight = {
      generatedAt: new Date().toISOString(),
      modelVersion: MODEL,
      headline: String(parsed.headline ?? ""),
      summary: String(parsed.summary ?? ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      cautions: Array.isArray(parsed.cautions) ? parsed.cautions.map(String) : [],
      bestFitRoles: Array.isArray(parsed.bestFitRoles) ? parsed.bestFitRoles.map(String) : [],
      managementHint: String(parsed.managementHint ?? ""),
      growthDirection: String(parsed.growthDirection ?? ""),
    };

    return new Response(JSON.stringify({ insight }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
