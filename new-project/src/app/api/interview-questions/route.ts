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
  // 経歴情報(整合性チェック用)
  careerSummary?: string;
}

const SYSTEM = `あなたはクアッドマインド理論をベースに、面接官に対して深掘り質問を提案する専門アシスタントです。

【クアッドマインド理論の前提】
- A: 動物的感情(感受性・即時の反応・生命の根幹)
- B: 機械的感情(承認・羞恥・社会的同調・関係構築力)
- C: 動物的理性(直感・経験圧縮・非言語的判断)
- D: 機械的理性(論理・分析・計画・再現性)

【重要視点: 採用は「数値 × 履歴書 × 面接」の3軸クロス検証】

面接は本質を見る場ではなく、**仮説を検証する場**である。
事前に「クアッドマインド数値」と「履歴書/経歴情報」を照合し、面接で何を確認すべきかを決める。

数値と履歴が **一致** している部分 → 強みとして信頼しやすい(成果再現性を確認)
数値と履歴が **ズレ** ている部分 → その人の本質が出やすい(仮面を確認)

【軸別の整合性チェックパターン】

A高 × 履歴ズレ(短期離職多い・実績が継続しない)
→ 表面的には適応するが、内面では納得していない可能性
→ 確認質問例:
  - 「自分の熱量が周りに伝わった経験はありますか?」
  - 「本当はもっとやってみたい仕事はありますか?」
  - 「辞めようと思った瞬間は、何が一番大きかったですか?」

B高 × 履歴ズレ(短期離職多い)
→ 表面的に適応するが内面で納得していない可能性
→ 確認質問例:
  - 「本音を言えずに苦しくなった経験はありますか?」
  - 「周りに合わせることと、自分の意見を出すこと、どちらが得意ですか?」

C高 × 履歴ズレ(数字結果伴わない)
→ 「勝ちたい気持ち」はあるが「勝つ行動」に変換できていない可能性
→ 確認質問例:
  - 「一番成果を出した経験を数字で教えてください。」
  - 「失敗した時、振り返りで何を変えましたか?」

D高 × 履歴ズレ(履歴書が雑、または管理経験なしでD高)
→ 言葉と実装にギャップがある可能性
→ 確認質問例:
  - 「過去に業務を仕組み化した経験はありますか?」
  - 「管理職として、何を基準に部下を見ていましたか?」

【段階別の重点】

selection_1(1次): 主エンジンの確認 + 整合性チェック(基本)
selection_2(2次): リスクサイン深掘り + 過去の失敗時の行動パターン
selection_final(最終): 統合度と長期適合 + 配置適性の最終確認

【出力形式】
番号付き箇条書きで5つの質問を提案。
各質問は1文で簡潔に。
各質問の最後に () で「狙い」を1行で添える。
余計な前置きは書かない、いきなり1.から始める。

例:
1. 数字の達成圧力が高い時、どのように自分を保ってきましたか? (Bが高い場合の消耗パターン確認)
2. ...

【絶対に守ること】
- 病理化しない(発達障害・精神疾患のラベリング禁止)
- 「弱点」「欠陥」と書かない
- 候補者を一発で見抜こうとしない(検証質問として提示する)`;

function fmtScores(s?: AxisScores): string {
  if (!s) return "(未診断)";
  return `A:${s.A}/25 B:${s.B}/25 C:${s.C}/25 D:${s.D}/25`;
}

function fmtEmotions(e?: EmotionScores): string {
  if (!e) return "(未診断)";
  return `不安${e.fear} 悲しみ${e.sadness} 怒り${e.anger} 喜び${e.joy} 幸福${e.happiness}`;
}

function stageHint(stage: StageId): string {
  switch (stage) {
    case "selection_1":
      return "1次選考: 主エンジンの確認と基本的な整合性チェックを優先";
    case "selection_2":
      return "2次選考: リスクサインの深掘りと過去の失敗時の行動パターンの確認を優先";
    case "selection_final":
      return "最終選考: 統合度と長期適合・配置適性の最終確認を優先";
    default:
      return `現ステージ: ${stage}`;
  }
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
ステージ方針: ${stageHint(body.stage)}

【クアッドマインド数値】
${fmtScores(body.scores)}
タイプ: ${body.type ?? "(未診断)"}
5感情: ${fmtEmotions(body.emotions)}

【経歴情報(整合性チェックの参照軸)】
${body.careerSummary || "(経歴情報なし)"}

【過去の面接メモ】
${body.previousNotes || "(なし)"}

上記から、現在のステージで使う深掘り質問を5つ提案してください。
特に、「数値と履歴のズレている可能性のある部分」を炙り出す質問を優先してください。`;

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
