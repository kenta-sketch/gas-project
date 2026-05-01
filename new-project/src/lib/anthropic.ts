import "server-only";

import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY が設定されていません。.env.local に設定してください。",
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
