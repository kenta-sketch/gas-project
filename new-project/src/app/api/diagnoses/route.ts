// 診断結果の中央保存API(Supabase PostgREST 経由)
// POST: 診断完了時にクライアントから保存(fire-and-forget)
// GET:  管理画面(/admin/responses)用の一覧取得
//
// 必要な環境変数(Vercel → Settings → Environment Variables):
//   SUPABASE_SERVICE_ROLE_KEY ── Supabase ダッシュボード → Settings → API keys → service_role
// URL はデフォルト値を埋め込み済み(公開情報のため)。

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://kgeeejyrcpethghuneix.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function restHeaders(): Record<string, string> {
  return {
    apikey: SERVICE_KEY!,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "content-type": "application/json",
  };
}

export async function POST(req: NextRequest) {
  if (!SERVICE_KEY) {
    // 未設定でも診断フロー自体は壊さない(クライアントは結果を無視する)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY が未設定です" },
      { status: 503 },
    );
  }
  try {
    const body = await req.json();
    const row = {
      client_diagnosis_id: body.clientDiagnosisId ?? null,
      version: body.version ?? "v3.0-30q",
      profile: body.profile ?? {},
      scores: body.scores ?? {},
      emotions: body.emotions ?? {},
      quad_type: body.quadType ?? "不明",
      result: body.result ?? {},
      answers: body.answers ?? null,
      personal_insight: body.personalInsight ?? null,
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/diagnoses`, {
      method: "POST",
      headers: { ...restHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `保存に失敗しました (${res.status}): ${text.slice(0, 300)}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  if (!SERVICE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY が未設定です", rows: [] },
      { status: 503 },
    );
  }
  try {
    const params = new URLSearchParams({
      select:
        "id,created_at,client_diagnosis_id,version,profile,scores,emotions,quad_type,result",
      order: "created_at.desc",
      limit: "300",
    });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/diagnoses?${params}`, {
      headers: restHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `取得に失敗しました (${res.status}): ${text.slice(0, 300)}`, rows: [] },
        { status: 502 },
      );
    }
    const rows = await res.json();
    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error", rows: [] },
      { status: 500 },
    );
  }
}
