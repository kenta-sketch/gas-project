import type { Applicant } from "@/lib/types";

// ダミー応募者(各フェーズに分散)
// 応募 3名 / 1次 2名 / 2次 2名 / 最終 2名 / 合格 1名 / 不採用 1名
export const APPLICANTS_SEED: Applicant[] = [
  // ===== 応募(applied) =====
  {
    id: "app_001",
    profile: {
      fullName: "田中 健太",
      ageRange: "20代後半",
      gender: "男性",
      email: "tanaka@example.com",
      phone: "090-1234-5678",
      appliedPosition: "営業職",
      appliedDate: "2026-04-28",
    },
    careerAnswers: {
      education: "○○大学 経済学部 卒業 (2020年3月)",
      workHistory: "新卒で広告代理店に入社、3年間法人営業を担当。リードジェン・既存顧客深耕の両方を経験。直近の数字は前年比115%。",
      selfPR: "クライアントの本質的な課題を聞き出す対話力に強み。データ分析より人と会って話して掴む方が得意。",
    },
    diagnoses: [
      {
        date: "2026-04-28",
        scenario: "応募時",
        answers: ["B", "A", "B", "A", "B", "B", "C", "B", "B"],
        scores: { A: 14, B: 21, C: 13, D: 11 },
        emotions: { fear: 3, sadness: 2, anger: 2, joy: 4, happiness: 3 },
        type: "承認欲求型",
      },
    ],
    currentStage: "applied",
    interviews: [],
    presetTendency: "B優位",
  },
  {
    id: "app_002",
    profile: {
      fullName: "伊藤 美咲",
      ageRange: "20代前半",
      gender: "女性",
      email: "ito.misaki@example.com",
      appliedPosition: "顧客対応職",
      appliedDate: "2026-04-29",
    },
    careerAnswers: {
      education: "△△短期大学 文学部 卒業 (2024年3月)",
      workHistory: "アパレルショップで接客販売2年。店長代理として後輩指導も担当。",
      selfPR: "お客様の表情の変化に敏感で、その日の気分に合わせた接客を心がけてきました。感情の機微を捉えるのが得意です。",
    },
    diagnoses: [
      {
        date: "2026-04-29",
        scenario: "応募時",
        answers: ["A", "A", "A", "A", "A", "C", "A", "B", "A"],
        scores: { A: 23, B: 13, C: 17, D: 14 },
        emotions: { fear: 4, sadness: 3, anger: 2, joy: 5, happiness: 4 },
        type: "ワガママ型",
      },
    ],
    currentStage: "applied",
    interviews: [],
    presetTendency: "A優位",
  },
  {
    id: "app_003",
    profile: {
      fullName: "渡辺 翔太",
      ageRange: "30代前半",
      gender: "男性",
      email: "watanabe@example.com",
      appliedPosition: "エンジニア",
      appliedDate: "2026-04-30",
    },
    careerAnswers: {
      education: "国立□□大学 工学部 情報工学科 卒業 (2017年3月)",
      workHistory: "Web系ベンチャーでバックエンド5年、その後SaaS企業でプロダクト基盤2年。Go / TypeScript / AWS。",
      selfPR: "技術選定の妥当性を論理的に詰めることに価値を置いています。曖昧な要件は必ず数字で詰めます。",
    },
    diagnoses: [
      {
        date: "2026-04-30",
        scenario: "応募時",
        answers: ["D", "D", "D", "D", "D", "C", "D", "D", "D"],
        scores: { A: 9, B: 13, C: 18, D: 22 },
        emotions: { fear: 2, sadness: 2, anger: 3, joy: 3, happiness: 3 },
        type: "理詰め型",
      },
    ],
    currentStage: "applied",
    interviews: [],
    presetTendency: "D優位",
  },

  // ===== 1次選考(selection_1) =====
  {
    id: "app_101",
    profile: {
      fullName: "高橋 優子",
      ageRange: "20代後半",
      gender: "女性",
      email: "takahashi@example.com",
      appliedPosition: "営業職",
      appliedDate: "2026-04-20",
    },
    careerAnswers: {
      education: "私立◇◇大学 商学部 卒業 (2019年3月)",
      workHistory: "メーカー営業4年。法人新規開拓中心。年間目標達成3年連続。",
      selfPR: "誠実さと粘り強さが武器。クライアントとの長期関係構築を得意としています。",
    },
    diagnoses: [
      {
        date: "2026-04-20",
        scenario: "応募時",
        answers: ["B", "B", "C", "B", "C", "B", "B", "B", "B"],
        scores: { A: 11, B: 19, C: 17, D: 11 },
        emotions: { fear: 3, sadness: 2, anger: 2, joy: 4, happiness: 4 },
        type: "承認欲求型",
      },
    ],
    currentStage: "selection_1",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-25",
        interviewer: "人事部 山下",
        suggestedQuestions: [
          "数字の達成圧力が高い時、どのように自分を保ってきましたか?",
          "顧客から強い反対意見を受けた時、どう対応しましたか?",
        ],
        notes: "誠実さは伝わるが、自分の意見を強く出す場面は控えめ。チーム内での承認欲求が強そう。",
        outcome: "pass",
      },
    ],
    presetTendency: "B優位",
  },
  {
    id: "app_102",
    profile: {
      fullName: "中村 健斗",
      ageRange: "20代前半",
      gender: "男性",
      email: "nakamura@example.com",
      appliedPosition: "新規事業推進",
      appliedDate: "2026-04-22",
    },
    careerAnswers: {
      education: "私立☆☆大学 経営学部 卒業 (2024年3月)",
      workHistory: "新卒入社のスタートアップで事業開発1年半。3つの新規事業立ち上げに関与。",
      selfPR: "0→1の不確実性に強い。データなき状況での仮説構築と実行が得意。",
    },
    diagnoses: [
      {
        date: "2026-04-22",
        scenario: "応募時",
        answers: ["C", "C", "A", "C", "A", "A", "C", "A", "A"],
        scores: { A: 17, B: 12, C: 18, D: 11 },
        emotions: { fear: 3, sadness: 2, anger: 2, joy: 5, happiness: 4 },
        type: "混合型",
      },
    ],
    currentStage: "selection_1",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-26",
        interviewer: "人事部 山下",
        suggestedQuestions: [
          "失敗した新規事業の振り返りを具体的にしてください",
          "数字の根拠なき決定をした時の判断基準は?",
        ],
        notes: "情熱と直感型の動き。論理的説明はやや弱め。",
        outcome: "pass",
      },
    ],
    presetTendency: "A優位",
  },

  // ===== 2次選考(selection_2) =====
  {
    id: "app_201",
    profile: {
      fullName: "小林 麻衣",
      ageRange: "30代前半",
      gender: "女性",
      email: "kobayashi@example.com",
      appliedPosition: "マーケティングマネージャー",
      appliedDate: "2026-04-15",
    },
    careerAnswers: {
      education: "国立◎◎大学 文学部 卒業 (2014年3月)",
      workHistory: "BtoB SaaSでマーケ7年。SEO・コンテンツ・広告運用を一通り。直近2年はチームマネジメント中心。",
      selfPR: "戦略から実行までを統合する視点を持ちます。チームの感情面と数字の両面に目を配ります。",
    },
    diagnoses: [
      {
        date: "2026-04-15",
        scenario: "応募時",
        answers: ["C", "D", "C", "D", "C", "B", "C", "D", "C"],
        scores: { A: 10, B: 12, C: 19, D: 17 },
        emotions: { fear: 2, sadness: 1, anger: 1, joy: 4, happiness: 4 },
        type: "混合型",
      },
    ],
    currentStage: "selection_2",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-19",
        interviewer: "人事部 山下",
        suggestedQuestions: [
          "チーム成果が出ていない時、最初に何を見ますか?",
          "感情と数字どちらかを優先する場面の判断基準は?",
        ],
        notes: "バランス感覚良好。論理と直感を両方使うタイプ。",
        outcome: "pass",
      },
      {
        stageId: "selection_2",
        date: "2026-04-26",
        interviewer: "マーケ責任者 大野",
        suggestedQuestions: [
          "現職での失敗経験で最も学んだことは?",
          "メンバーがミスした時の関わり方を具体的に",
        ],
        notes: "現場の温度感を捉えつつ、データドリブンな改善も実装している印象。",
        outcome: "pending",
      },
    ],
    presetTendency: "統合",
  },
  {
    id: "app_202",
    profile: {
      fullName: "加藤 陽介",
      ageRange: "30代後半",
      gender: "男性",
      email: "kato@example.com",
      appliedPosition: "経営企画",
      appliedDate: "2026-04-18",
    },
    careerAnswers: {
      education: "国立◯◯大学 経済学部 卒業 (2010年3月)",
      workHistory: "コンサル7年→事業会社経営企画5年。M&Aと中期経営計画の策定経験。",
      selfPR: "数値と戦略を結びつける論理性。一方で、現場感を意識した提案を心がけてきました。",
    },
    diagnoses: [
      {
        date: "2026-04-18",
        scenario: "応募時",
        answers: ["D", "D", "D", "D", "C", "D", "D", "D", "D"],
        scores: { A: 8, B: 11, C: 15, D: 23 },
        emotions: { fear: 2, sadness: 2, anger: 2, joy: 3, happiness: 3 },
        type: "理詰め型",
      },
    ],
    currentStage: "selection_2",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-22",
        interviewer: "人事部 山下",
        suggestedQuestions: [
          "感情的な対立場面でどう振る舞いますか?",
          "数字で説明できないものをどう扱いますか?",
        ],
        notes: "論理一貫している。感情面の弱さが現職での課題と本人も認識。",
        outcome: "pass",
      },
    ],
    presetTendency: "D優位",
  },

  // ===== 最終選考(selection_final) =====
  {
    id: "app_301",
    profile: {
      fullName: "吉田 康太",
      ageRange: "30代前半",
      gender: "男性",
      email: "yoshida@example.com",
      appliedPosition: "プロダクトマネージャー",
      appliedDate: "2026-04-10",
    },
    careerAnswers: {
      education: "国立△△大学 理学部 卒業 (2014年3月)",
      workHistory: "エンジニア4年→PM6年。BtoB / BtoC両方経験。直近はAI系プロダクト。",
      selfPR: "技術と顧客の橋渡しに価値があると考えます。要件は数字と感情の両方で握ります。",
    },
    diagnoses: [
      {
        date: "2026-04-10",
        scenario: "応募時",
        answers: ["C", "D", "C", "C", "B", "C", "C", "D", "B"],
        scores: { A: 11, B: 14, C: 19, D: 17 },
        emotions: { fear: 2, sadness: 2, anger: 2, joy: 4, happiness: 4 },
        type: "統合型",
      },
    ],
    currentStage: "selection_final",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-14",
        interviewer: "人事部 山下",
        suggestedQuestions: ["失敗事例を構造的に説明してください"],
        notes: "落ち着いた立ち振る舞い。バランス感覚あり。",
        outcome: "pass",
      },
      {
        stageId: "selection_2",
        date: "2026-04-21",
        interviewer: "プロダクト責任者 緒方",
        suggestedQuestions: ["優先順位の決定基準は?"],
        notes: "ロードマップ思考が明確。技術選定の根拠も納得できる。",
        outcome: "pass",
      },
    ],
    presetTendency: "統合",
  },
  {
    id: "app_302",
    profile: {
      fullName: "斎藤 里奈",
      ageRange: "20代後半",
      gender: "女性",
      email: "saito@example.com",
      appliedPosition: "カスタマーサクセス",
      appliedDate: "2026-04-12",
    },
    careerAnswers: {
      education: "私立◆◆大学 国際関係学部 卒業 (2018年3月)",
      workHistory: "外資SaaS企業でCS5年。エンタープライズアカウント担当。",
      selfPR: "顧客の言語化されない課題を引き出す対話力。長期関係の構築に強み。",
    },
    diagnoses: [
      {
        date: "2026-04-12",
        scenario: "応募時",
        answers: ["A", "B", "A", "C", "A", "B", "A", "B", "A"],
        scores: { A: 17, B: 14, C: 14, D: 10 },
        emotions: { fear: 3, sadness: 3, anger: 2, joy: 5, happiness: 4 },
        type: "混合型",
      },
    ],
    currentStage: "selection_final",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-16",
        interviewer: "人事部 山下",
        suggestedQuestions: ["顧客との衝突場面の処理方法"],
        notes: "感情への感度高い。情熱が伝わる。",
        outcome: "pass",
      },
      {
        stageId: "selection_2",
        date: "2026-04-23",
        interviewer: "CS責任者 三浦",
        suggestedQuestions: ["数字とリレーションどちらを優先しますか?"],
        notes: "リレーション重視。数字は後追いで意識する型。",
        outcome: "pass",
      },
    ],
    presetTendency: "A優位",
  },

  // ===== 合格(hired - 入社待ち) =====
  {
    id: "app_401",
    profile: {
      fullName: "林 大樹",
      ageRange: "30代前半",
      gender: "男性",
      email: "hayashi@example.com",
      appliedPosition: "セールスマネージャー",
      appliedDate: "2026-04-05",
    },
    careerAnswers: {
      education: "国立※※大学 経済学部 卒業 (2014年3月)",
      workHistory: "外資セールス→国内SaaSセールスマネージャー6年。チーム10名規模をマネジメント。",
      selfPR: "数字と人の両方を見るマネージャー像を磨いてきました。再現性ある仕組み作りが武器。",
    },
    diagnoses: [
      {
        date: "2026-04-05",
        scenario: "応募時",
        answers: ["C", "B", "C", "D", "C", "B", "C", "D", "B"],
        scores: { A: 11, B: 16, C: 19, D: 14 },
        emotions: { fear: 2, sadness: 2, anger: 2, joy: 5, happiness: 5 },
        type: "統合型",
      },
    ],
    currentStage: "hired",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-08",
        interviewer: "人事部 山下",
        suggestedQuestions: [],
        notes: "落ち着き、明快さ。マネジメント経験の厚みを感じる。",
        outcome: "pass",
      },
      {
        stageId: "selection_2",
        date: "2026-04-15",
        interviewer: "セールス責任者 大島",
        suggestedQuestions: [],
        notes: "再現性の説明が具体的。マネジメント観も健全。",
        outcome: "pass",
      },
      {
        stageId: "selection_final",
        date: "2026-04-22",
        interviewer: "代表 健太",
        suggestedQuestions: [],
        notes: "経営目線も持っている。配属候補は法人セールスチームのマネージャーが妥当。",
        outcome: "pass",
      },
    ],
    presetTendency: "統合",
  },

  // ===== 不採用 =====
  {
    id: "app_901",
    profile: {
      fullName: "森 健司",
      ageRange: "40代前半",
      gender: "男性",
      email: "mori@example.com",
      appliedPosition: "営業職",
      appliedDate: "2026-04-19",
    },
    careerAnswers: {
      education: "私立××大学 工学部 卒業 (2003年3月)",
      workHistory: "営業10年→管理職7年。直近は不振。",
      selfPR: "経験を活かしたい。",
    },
    diagnoses: [
      {
        date: "2026-04-19",
        scenario: "応募時",
        answers: ["B", "B", "B", "A", "B", "B", "B", "B", "B"],
        scores: { A: 13, B: 19, C: 9, D: 9 },
        emotions: { fear: 4, sadness: 4, anger: 4, joy: 2, happiness: 2 },
        type: "承認欲求型",
      },
    ],
    currentStage: "rejected",
    interviews: [
      {
        stageId: "selection_1",
        date: "2026-04-23",
        interviewer: "人事部 山下",
        suggestedQuestions: ["直近の不振の原因分析を具体的に"],
        notes: "原因を外部要因に帰属する傾向が強い。組織との摩擦リスク。",
        outcome: "fail",
      },
    ],
    presetTendency: "B優位",
    generalNotes: "感情反応の高さ + Bへの極端な偏重で、現職場への適合が難しいと判断。",
  },
];
