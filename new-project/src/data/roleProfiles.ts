import type { AxisKey, AxisScores } from "@/lib/types";

// クアッドマインド職種適性マップ(精密版25職種)
// 出典: docs/theory/notes/2026-05-06-quadmind-map.md
// 各レンジ(min-max)の中央値を理想値として使い、上限と下限のバランスから重みを算出する。

export interface RoleProfile {
  id: string;
  category: string;
  label: string;
  // 各軸の理想レンジ(25点満点中)
  ranges: { A: [number, number]; B: [number, number]; C: [number, number]; D: [number, number] };
  primary: AxisKey[]; // 主軸(複数可)
  description: string;
  // 危険サイン(配置リスク)
  risk: string;
}

export const ROLE_PROFILES: RoleProfile[] = [
  // ── 営業 ──────────────────────────
  {
    id: "sales_new",
    category: "営業",
    label: "新規開拓営業",
    ranges: { A: [21, 25], B: [10, 18], C: [18, 24], D: [10, 16] },
    primary: ["A", "C"],
    description: "断られても動ける突破力と、その場で勝ち筋を掴む判断力。",
    risk: "B低 → 押し売り化 / D低 → 属人化",
  },
  {
    id: "sales_route",
    category: "営業",
    label: "既存・ルート営業",
    ranges: { A: [10, 17], B: [21, 25], C: [14, 20], D: [16, 22] },
    primary: ["B", "D"],
    description: "関係性を維持しながら継続接点を管理できる人。",
    risk: "A高すぎ → 短期志向で関係を壊す",
  },
  {
    id: "sales_solution",
    category: "営業",
    label: "法人・ソリューション営業",
    ranges: { A: [12, 20], B: [16, 23], C: [21, 25], D: [20, 25] },
    primary: ["C", "D"],
    description: "課題整理・意思決定構造・案件管理が重要。勢いより精度。",
    risk: "C低 → 提案浅い / D低 → 案件が崩れる",
  },
  {
    id: "cs_support",
    category: "営業",
    label: "カスタマーサポート",
    ranges: { A: [6, 14], B: [21, 25], C: [12, 18], D: [20, 25] },
    primary: ["B", "D"],
    description: "安心感と対応品質の再現性。Bだけでは足りない。",
    risk: "B低 → 顧客を怒らせる / D低 → 品質崩れる",
  },
  {
    id: "cs_success",
    category: "営業",
    label: "カスタマーサクセス",
    ranges: { A: [10, 18], B: [20, 25], C: [18, 24], D: [18, 25] },
    primary: ["B", "C", "D"],
    description: "顧客の成功を定義し継続利用に導く。Bだけでは御用聞き。",
    risk: "C低 → 改善提案不可 / D低 → 解約予兆を逃す",
  },

  // ── マーケ・広報 ────────────────────
  {
    id: "marketing",
    category: "マーケ・広報",
    label: "マーケティング",
    ranges: { A: [16, 22], B: [12, 20], C: [20, 25], D: [18, 25] },
    primary: ["C", "D"],
    description: "センスではなく、仮説を立て数字で検証する仕事。",
    risk: "D低 → 感覚マーケに陥る / C低 → 市場理解が浅い",
  },
  {
    id: "pr",
    category: "マーケ・広報",
    label: "広報・PR",
    ranges: { A: [12, 20], B: [21, 25], C: [18, 24], D: [14, 22] },
    primary: ["B", "C"],
    description: "企業がどう見られるかを設計する仕事。",
    risk: "B低 → 炎上リスク / A高すぎ → 不用意に動く",
  },

  // ── 企画・事業 ──────────────────────
  {
    id: "product_planning",
    category: "企画・事業",
    label: "商品・サービス企画",
    ranges: { A: [14, 22], B: [14, 22], C: [21, 25], D: [18, 25] },
    primary: ["C", "D"],
    description: "顧客課題を商品に変換する。Cが低いとアイデアで終わる。",
    risk: "D低 → 実装不可 / B低 → 顧客の痛みを外す",
  },
  {
    id: "biz_planning",
    category: "企画・事業",
    label: "事業企画",
    ranges: { A: [10, 18], B: [14, 22], C: [21, 25], D: [21, 25] },
    primary: ["C", "D"],
    description: "経営課題・市場・現場を構造化し現場が動く設計まで落とす。",
    risk: "B低 → 正しくても現場が動かない",
  },
  {
    id: "corporate_planning",
    category: "企画・事業",
    label: "経営企画",
    ranges: { A: [8, 16], B: [12, 20], C: [22, 25], D: [22, 25] },
    primary: ["C", "D"],
    description: "数字・市場・組織課題を経営判断に変換する。衝動より精度。",
    risk: "A高すぎ → 精度より勢いで動く",
  },
  {
    id: "new_business",
    category: "企画・事業",
    label: "新規事業",
    ranges: { A: [21, 25], B: [12, 20], C: [21, 25], D: [18, 24] },
    primary: ["A", "C", "D"],
    description: "不確実性の中で動きながら仮説を事業構造に変える。",
    risk: "B低 → 人がついてこない",
  },

  // ── 人材・教育 ──────────────────────
  {
    id: "hr",
    category: "人材・教育",
    label: "人事・採用",
    ranges: { A: [10, 18], B: [21, 25], C: [18, 24], D: [18, 25] },
    primary: ["B", "C", "D"],
    description: "人の本音を引き出し、経歴と行動の矛盾を見抜き、制度に落とす。",
    risk: "Bだけ高い → 感情採用 / D低 → 採用基準が属人化",
  },
  {
    id: "education",
    category: "人材・教育",
    label: "教育・研修",
    ranges: { A: [12, 20], B: [20, 25], C: [18, 24], D: [21, 25] },
    primary: ["B", "C", "D"],
    description: "できる理由を他人に再現させられる人。できる人ではない。",
    risk: "D低 → 研修が感覚 / B低 → 受講者がついてこない",
  },
  {
    id: "manager",
    category: "人材・教育",
    label: "管理職・マネージャー",
    ranges: { A: [12, 20], B: [21, 25], C: [18, 24], D: [21, 25] },
    primary: ["B", "D"],
    description: "売れる人とは違う。人と数字を同時に扱う職種。",
    risk: "Dのみ高+B低 → 冷たい管理者 / Bのみ高+D低 → 優しいだけ",
  },

  // ── 管理・専門職 ──────────────────────
  {
    id: "admin",
    category: "管理・専門職",
    label: "事務・総務",
    ranges: { A: [4, 14], B: [16, 24], C: [10, 18], D: [22, 25] },
    primary: ["D"],
    description: "正確に支え、組織の摩擦を減らす。安定処理が本質。",
    risk: "A高すぎ → 安定業務に飽きやすい",
  },
  {
    id: "accounting",
    category: "管理・専門職",
    label: "経理・財務",
    ranges: { A: [4, 12], B: [10, 18], C: [18, 24], D: [22, 25] },
    primary: ["D", "C"],
    description: "数字の正確性が最重要。上位職ほどCが必要になる。",
    risk: "A高すぎ → 反復安定処理に不向き",
  },
  {
    id: "legal",
    category: "管理・専門職",
    label: "法務・コンプライアンス",
    ranges: { A: [4, 12], B: [12, 20], C: [20, 25], D: [22, 25] },
    primary: ["D", "C"],
    description: "会社を守りながら進める仕事。止める仕事ではない。",
    risk: "C低 → 本質的リスク見逃す / B低 → 現場から嫌われる",
  },
  {
    id: "audit",
    category: "管理・専門職",
    label: "内部監査・リスク管理",
    ranges: { A: [4, 12], B: [12, 20], C: [20, 25], D: [22, 25] },
    primary: ["D", "C"],
    description: "違和感を見つけ、証拠を整理し、リスクを構造化する。",
    risk: "B低すぎ → 現場から情報が上がらない",
  },
  {
    id: "pm",
    category: "管理・専門職",
    label: "PM・PMO",
    ranges: { A: [12, 20], B: [18, 24], C: [18, 24], D: [21, 25] },
    primary: ["D", "B", "C"],
    description: "進捗・人・リスク・納期を同時に扱う職種。",
    risk: "D低 → 進行管理崩れ / B低 → 関係者が動かない",
  },

  // ── IT・データ ────────────────────────
  {
    id: "engineer",
    category: "IT・データ",
    label: "IT・エンジニア",
    ranges: { A: [8, 18], B: [8, 18], C: [18, 25], D: [21, 25] },
    primary: ["D", "C"],
    description: "構造を作り問題を分解する。優秀なエンジニアほどCが高い。",
    risk: "D低 → 設計が崩れる / C低 → 問題解決が浅い",
  },
  {
    id: "data",
    category: "IT・データ",
    label: "データ分析・BI",
    ranges: { A: [6, 14], B: [10, 18], C: [21, 25], D: [22, 25] },
    primary: ["D", "C"],
    description: "数字を見る仕事ではなく、数字を意思決定に変える仕事。",
    risk: "B低 → 現場に伝わらない",
  },

  // ── 製造・品質 ────────────────────────
  {
    id: "creative",
    category: "製造・品質",
    label: "クリエイティブ・デザイン",
    ranges: { A: [18, 25], B: [14, 22], C: [20, 25], D: [10, 20] },
    primary: ["A", "C"],
    description: "違和感を表現に変える職種。Aが低いと表現衝動が弱い。",
    risk: "D低すぎ → 納期・品質が崩れる",
  },
  {
    id: "production",
    category: "製造・品質",
    label: "生産管理",
    ranges: { A: [6, 16], B: [14, 22], C: [18, 24], D: [22, 25] },
    primary: ["D", "C"],
    description: "工程・納期・人員・在庫を安定させる。",
    risk: "B低 → 現場調整で摩擦が起きる",
  },
  {
    id: "quality",
    category: "製造・品質",
    label: "品質管理",
    ranges: { A: [4, 12], B: [12, 20], C: [20, 25], D: [22, 25] },
    primary: ["D", "C"],
    description: "基準を守り、異常を見逃さない。Aは高すぎない方が安定。",
    risk: "DとC低 → 品質事故につながる",
  },
  {
    id: "logistics",
    category: "製造・品質",
    label: "物流・購買・調達",
    ranges: { A: [8, 18], B: [16, 22], C: [18, 24], D: [21, 25] },
    primary: ["D", "C", "B"],
    description: "在庫・納期・コスト・取引先を管理する。",
    risk: "B低 → 取引先との関係が悪化する",
  },
];

// 適合度スコア = 各軸が理想レンジにどれだけ収まっているかの平均(0-1)
// プライマリ軸の重みを2倍にする
export function fitScore(scores: AxisScores, profile: RoleProfile): number {
  const axes: AxisKey[] = ["A", "B", "C", "D"];
  let totalWeight = 0;
  let totalScore = 0;
  axes.forEach((k) => {
    const weight = profile.primary.includes(k) ? 2 : 1;
    const [min, max] = profile.ranges[k];
    const v = scores[k];
    let axisScore: number;
    if (v >= min && v <= max) {
      axisScore = 1.0; // 完全フィット
    } else if (v < min) {
      const diff = min - v;
      axisScore = Math.max(0, 1 - diff / 12); // 12点離れたら0
    } else {
      // v > max
      const diff = v - max;
      axisScore = Math.max(0, 1 - diff / 12);
    }
    totalScore += axisScore * weight;
    totalWeight += weight;
  });
  return totalScore / totalWeight;
}

// カテゴリでグルーピング
export function groupedRoles(): Record<string, RoleProfile[]> {
  const out: Record<string, RoleProfile[]> = {};
  ROLE_PROFILES.forEach((p) => {
    if (!out[p.category]) out[p.category] = [];
    out[p.category].push(p);
  });
  return out;
}
