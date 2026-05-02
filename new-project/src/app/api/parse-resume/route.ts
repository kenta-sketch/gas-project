import { NextRequest } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `あなたは履歴書/職務経歴書の画像またはPDFを読み取り、構造化されたJSONとして返す抽出アシスタントです。

以下のJSONスキーマで出力してください。情報が読み取れない項目は省略してください。
余計な説明は書かず、JSONオブジェクトのみを返してください。

{
  "fullName": "氏名",
  "age": "年齢または生年月日",
  "gender": "性別",
  "address": "住所",
  "email": "メールアドレス",
  "phone": "電話番号",
  "education": [
    { "school": "学校名", "period": "在学期間 (例: 2014/04 - 2018/03)", "degree": "学位/学科" }
  ],
  "workHistory": [
    { "company": "会社名", "period": "在籍期間", "role": "役職/職種", "description": "職務内容の要約" }
  ],
  "skills": ["スキル1", "スキル2"],
  "selfPR": "自己PR文(原文をできる限り保持)"
}`;

export async function POST(req: NextRequest) {
  let body: { fileBase64: string; mediaType: string; fileName?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!body.fileBase64 || !body.mediaType) {
    return new Response("fileBase64 と mediaType が必要", { status: 400 });
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

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: body.mediaType === "application/pdf" ? "document" : "image",
              source: {
                type: "base64",
                media_type: body.mediaType as "application/pdf" | "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: body.fileBase64,
              },
            } as never,
            {
              type: "text",
              text: "この履歴書から情報を抽出してJSONで返してください。",
            },
          ],
        },
      ],
    });
    const text = message.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");
    // 念のためコードフェンスを除去してからJSON.parse
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // JSON 抽出失敗時は raw を返す
      return new Response(JSON.stringify({ raw: text, error: "JSON抽出失敗" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    if (body.fileName) parsed.fileName = body.fileName;
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
