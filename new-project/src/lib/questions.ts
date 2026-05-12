// クアッドマインド診断 採点エンジン v3.0 (強制選択式) 質問データ
// 出典: docs/theory/notes/2026-05-12-scoring-engine-v3.md
// 72問 × 4選択肢。採点キーは src/data/scoring-db-v3.ts 参照

import type { DiagnosticQuestion, EmotionKey } from "./types";

const opts = (a: string, b: string, c: string, d: string) =>
  [
    { id: "a" as const, text: a },
    { id: "b" as const, text: b },
    { id: "c" as const, text: c },
    { id: "d" as const, text: d },
  ];

// ============================================================
// G1: 4軸 各8問(計32問)
// ============================================================
export const AXIS_QUESTIONS: DiagnosticQuestion[] = [
  // ----- A軸 -----
  { id: "A-1", category: "axis_A", kind: "core",
    text: "気に入らないことがあると、まず起きることは",
    options: opts(
      "まず身体が反応する",
      "「どう見られるか」が先に来る",
      "「過去の似た経験」が浮かぶ",
      "「どう対処するか」を考え始める",
    ) },
  { id: "A-2", category: "axis_A", kind: "core",
    text: "自分の好き嫌いは",
    options: opts(
      "はっきりしている。確信がある",
      "相手や状況によって変わる",
      "経験から自然と決まっている",
      "根拠を整理してから決まる",
    ) },
  { id: "A-3", category: "axis_A", kind: "core",
    text: "何かを始めるとき、最初に動くのは",
    options: opts(
      "「やりたい」という感覚",
      "「周囲にどう見られるか」",
      "「これは行ける」という読み",
      "「目的と手順」の確認",
    ) },
  { id: "A-4", category: "axis_A", kind: "support",
    text: "楽しいことへの没頭は",
    options: opts(
      "理由なく引き込まれる",
      "誰かと共有できると深まる",
      "自分の得意な領域で自然に起きる",
      "目標が明確なときに起きる",
    ) },
  { id: "A-5", category: "axis_A", kind: "support",
    text: "怒りや興奮は",
    options: opts(
      "思っていたより強く出ることがある",
      "相手の前では出さないようにしている",
      "状況を読んでから出すか決める",
      "感情より判断を優先できる",
    ) },
  { id: "A-6", category: "axis_A", kind: "support",
    text: "感情が動いていないとき",
    options: opts(
      "行動のエネルギーが湧きにくい",
      "周囲の期待でカバーできる",
      "経験や直感で動ける",
      "論理と目的があれば動ける",
    ) },
  { id: "A-7", category: "axis_A", kind: "reverse",
    text: "感情を表に出すことについて",
    options: opts(
      "自然なことだ。抑える方が不自然",
      "場と相手によって使い分けるべきだ",
      "状況の読み次第で決める",
      "大人として控えるべき場面がある",
    ) },
  { id: "A-8", category: "axis_A", kind: "reverse",
    text: "自分の感情と場の雰囲気が対立するとき",
    options: opts(
      "感情を優先することが多い",
      "場の雰囲気を優先することがほとんど",
      "場を読んで最善手を選ぶ",
      "論理的に正しい方を選ぶ",
    ) },

  // ----- B軸 -----
  { id: "B-1", category: "axis_B", kind: "core",
    text: "失敗や恥ずかしいことを見られると",
    options: opts(
      "頭から離れない・何日も引きずる",
      "感情が強く出るが翌日には切り替える",
      "次にどう動くかを考えて切り替える",
      "「なぜそうなったか」を読んで終わる",
    ) },
  { id: "B-2", category: "axis_B", kind: "core",
    text: "相手が何を期待しているかを",
    options: opts(
      "無意識に読もうとしている",
      "あまり意識しない。自分の軸で動く",
      "経験から自然と読める",
      "必要なときに意識的に確認する",
    ) },
  { id: "B-3", category: "axis_B", kind: "core",
    text: "断ることへの抵抗は",
    options: opts(
      "強い。断った後も気になる",
      "ほぼない。必要なら断る",
      "状況を読んで判断する",
      "理由が明確なら断れる",
    ) },
  { id: "B-4", category: "axis_B", kind: "support",
    text: "グループの中で浮いていると感じると",
    options: opts(
      "言動を調整したくなる",
      "気にせず自分のペースで動く",
      "場の状況を読んで対応を変える",
      "問題があるか論理的に確認する",
    ) },
  { id: "B-5", category: "axis_B", kind: "support",
    text: "他者からの評価が上がると",
    options: opts(
      "自分の調子も上がる",
      "評価より成果の手応えを重視する",
      "次の展開を読むきっかけになる",
      "客観的な指標として参考にする",
    ) },
  { id: "B-6", category: "axis_B", kind: "support",
    text: "「自分だけ違う意見を言う」ことには",
    options: opts(
      "エネルギーが要る",
      "特に抵抗はない",
      "タイミングと場を読んでから言う",
      "根拠があれば躊躇しない",
    ) },
  { id: "B-7", category: "axis_B", kind: "reverse",
    text: "他人の目は",
    options: opts(
      "ほとんど気にならない",
      "かなり気になる",
      "関係性によって変わる",
      "客観的な情報として活用する",
    ) },
  { id: "B-8", category: "axis_B", kind: "reverse",
    text: "承認されなくても",
    options: opts(
      "自分のやり方を変えるつもりはない",
      "不安になる・やる気が落ちる",
      "状況を読んで柔軟に変える",
      "根拠があれば維持する",
    ) },

  // ----- C軸 -----
  { id: "C-1", category: "axis_C", kind: "core",
    text: "理由を説明できないが「これは違う」「これが正しい」という感覚は",
    options: opts(
      "よく来る。その感覚を信頼している",
      "感情が反応しているだけだと思う",
      "周囲の空気から来ることが多い",
      "根拠が出るまでは判断しない",
    ) },
  { id: "C-2", category: "axis_C", kind: "core",
    text: "初対面の人に対して",
    options: opts(
      "早い段階でどんな人か読める",
      "好き嫌いが先に来る",
      "相手がどう思っているかが気になる",
      "時間をかけて情報を集めてから判断する",
    ) },
  { id: "C-3", category: "axis_C", kind: "core",
    text: "「今この瞬間が勝負どころ」という感覚は",
    options: opts(
      "よく来る。その瞬間に動ける",
      "感情が高まった瞬間に来る",
      "相手の反応が変わった瞬間に来る",
      "データが揃ったときに来る",
    ) },
  { id: "C-4", category: "axis_C", kind: "support",
    text: "「このパターン、前に見たことがある」という感覚は",
    options: opts(
      "よく来る。経験から読んでいる",
      "感情的な記憶として来る",
      "人間関係のパターンとして来る",
      "データや事例として記憶している",
    ) },
  { id: "C-5", category: "axis_C", kind: "support",
    text: "データが出そろう前に",
    options: opts(
      "結論の方向性が見えることがある",
      "感情が先に答えを出す",
      "相手の雰囲気から読めることがある",
      "データが揃うまで判断を保留する",
    ) },
  { id: "C-6", category: "axis_C", kind: "support",
    text: "言語化できないが「この判断は正しい」という確信は",
    options: opts(
      "来ることがある。その確信を使える",
      "感情的な確信として来る",
      "場の空気との一致感として来る",
      "根拠が揃ってから確信が生まれる",
    ) },
  { id: "C-7", category: "axis_C", kind: "reverse",
    text: "根拠がない判断については",
    options: opts(
      "信用しない。根拠が必要だ",
      "経験があれば有効だと思う",
      "感情的な判断は大切にしたい",
      "その場の空気を読んだ判断は価値がある",
    ) },
  { id: "C-8", category: "axis_C", kind: "reverse",
    text: "「なんとなく」で決めることは",
    options: opts(
      "経験に基づくなら有効な判断だ",
      "感情に正直なことだと思う",
      "場の流れに乗ることでもある",
      "ほぼない。根拠を持って決める",
    ) },

  // ----- D軸 -----
  { id: "D-1", category: "axis_D", kind: "core",
    text: "行動する前に",
    options: opts(
      "目的・手順・想定リスクを整理したくなる",
      "「やりたい」という感覚が先に来る",
      "相手や状況の反応を先に読む",
      "過去の経験から判断して動き始める",
    ) },
  { id: "D-2", category: "axis_D", kind: "core",
    text: "同じ成果を出すなら",
    options: opts(
      "再現性がある方法を選ぶ",
      "自分がやりたい方法を選ぶ",
      "チームが動きやすい方法を選ぶ",
      "現場で最もうまくいく方法を選ぶ",
    ) },
  { id: "D-3", category: "axis_D", kind: "core",
    text: "判断は",
    options: opts(
      "論理的な根拠に基づくことを信頼する",
      "感情・直感を信頼する",
      "場の空気・他者の反応を参照する",
      "経験の積み重ねから来る直感を信頼する",
    ) },
  { id: "D-4", category: "axis_D", kind: "support",
    text: "曖昧な状況よりも",
    options: opts(
      "ルールや基準が明確な状況の方が力を発揮できる",
      "自由に動ける状況の方が力を発揮できる",
      "関係性が安定している状況の方が安心できる",
      "経験が活かせる状況の方が強い",
    ) },
  { id: "D-5", category: "axis_D", kind: "support",
    text: "計画が崩れると",
    options: opts(
      "立て直すまでのコストが大きい",
      "感情的にしんどくなる",
      "周囲への影響が気になる",
      "経験から即座に代替手を動かせる",
    ) },
  { id: "D-6", category: "axis_D", kind: "support",
    text: "「なぜそうするのか」を説明できないプロセスには",
    options: opts(
      "従いたくない",
      "直感的に違和感がある",
      "場の空気を読んで従うことはある",
      "経験的に意味があると分かれば従える",
    ) },
  { id: "D-7", category: "axis_D", kind: "reverse",
    text: "計画よりその場の判断で動く方が",
    options: opts(
      "性に合っている",
      "状況次第でそちらの方がいい",
      "場に合わせた柔軟さとして大切だ",
      "あまりない。計画を優先する",
    ) },
  { id: "D-8", category: "axis_D", kind: "reverse",
    text: "ルールや手順は",
    options: opts(
      "状況次第で無視していい",
      "場の空気によって柔軟に変えられる",
      "経験上うまくいく方を選ぶ",
      "守ることが再現性と信頼を作る",
    ) },
];

// ============================================================
// G2: A発火/A表出の分離(10問)
// ============================================================
export const A_SEPARATION_QUESTIONS: DiagnosticQuestion[] = [
  // 内的A
  { id: "iA-1", category: "iA", kind: "core",
    text: "気に入らないことがあると",
    options: opts(
      "まず身体が反応する",
      "その場をどう治めるかを考える",
      "相手にどう見られるかが頭をよぎる",
      "特に何も来ない",
    ) },
  { id: "iA-2", category: "iA", kind: "core",
    text: "好きな音楽や映画に触れたとき、内側で起きることは",
    options: opts(
      "感情が強く動く",
      "なぜ感動するかを分析したくなる",
      "誰かとその感動を共有したくなる",
      "心地よいが感情的には静かだ",
    ) },
  { id: "iA-3", category: "iA", kind: "support",
    text: "感情が動いていない日が続いたとき",
    options: opts(
      "何かが足りない・物足りない",
      "むしろ冷静に動けていると感じる",
      "周囲との関係が薄くなっている気がする",
      "特に気にならない",
    ) },
  { id: "iA-4", category: "iA", kind: "support",
    text: "心から関われない仕事が続いたとき、身体や気力への影響は",
    options: opts(
      "気力・体調が明確に落ちる",
      "目的を再確認すれば動ける",
      "周囲の期待で保てる",
      "淡々とこなせる",
    ) },
  { id: "iA-5", category: "iA", kind: "support",
    text: "自分の内側の好き嫌いは",
    options: opts(
      "はっきりしていて、確信がある",
      "論理的な根拠があるときにはっきりする",
      "相手や状況によって変わる",
      "あまり強くない",
    ) },
  // 表出A
  { id: "eA-1", category: "eA", kind: "core",
    text: "嬉しいことがあったとき",
    options: opts(
      "その場で素直に表現する",
      "タイミングを選んで伝える",
      "相手が喜ぶ形で伝える",
      "あまり外には出さない",
    ) },
  { id: "eA-2", category: "eA", kind: "core",
    text: "嫌なことがあったとき",
    options: opts(
      "「嫌だ」と伝える",
      "理由を整理してから伝える",
      "関係を壊さない言い方を探す",
      "心の中にとどめておく",
    ) },
  { id: "eA-3", category: "eA", kind: "core",
    text: "感情を表に出した後、最もよく起きることは",
    options: opts(
      "すっきりする・関係が深まる",
      "言い方がよかったか振り返る",
      "相手の反応が気になり続ける",
      "感情を出す機会がほとんどない",
    ) },
  { id: "eA-4", category: "eA", kind: "support",
    text: "断ることへの抵抗は",
    options: opts(
      "ほぼない。必要なら断る",
      "理由が明確なら断れる",
      "強い。断った後も気になる",
      "状況による",
    ) },
  { id: "eA-5", category: "eA", kind: "support",
    text: "本音と建前について",
    options: opts(
      "なるべく本音で話す",
      "場に応じて使い分けることが合理的だ",
      "建前が多い。本音は出しにくい",
      "あまり意識したことがない",
    ) },
];

// 凍結判別(条件分岐: 内的A高 × 表出A低 のみ表示)
export const FZ_QUESTIONS: DiagnosticQuestion[] = [
  { id: "FZ-1", category: "FZ", kind: "core",
    text: "強いプレッシャーや衝撃的な出来事があったとき、身体・思考はどうなるか",
    options: opts(
      "頭が真っ白・身体が固まる",
      "感情が切れる感覚がある",
      "強く動揺するが動ける",
      "冷静に対処できる",
    ) },
  { id: "FZ-2", category: "FZ", kind: "core",
    text: "過去の強い恐怖・衝撃的な経験が、今も特定の場面での反応に影響しているか",
    options: opts(
      "明確に影響している",
      "薄々そう感じる",
      "あまりないと思う",
      "影響していない",
    ) },
];

// ============================================================
// G4: 統合状態(Observer + 切り替え自覚)(10問)
// ============================================================
export const INTEGRATION_QUESTIONS: DiagnosticQuestion[] = [
  // Observer起動
  { id: "OB-1", category: "OB", kind: "core",
    text: "感情が強く動いたとき",
    options: opts(
      "少し間を置いてから行動できることがある",
      "感情のまま動くことが多い",
      "周囲の反応を見てから動く",
      "論理的に整理してから動く",
    ) },
  { id: "OB-2", category: "OB", kind: "core",
    text: "「今、自分は感情的になっている」という気づきは",
    options: opts(
      "感情の中でも来ることがある",
      "後から来ることが多い",
      "相手の反応で気づくことが多い",
      "振り返りのときに整理して気づく",
    ) },
  { id: "OB-3", category: "OB", kind: "support",
    text: "衝動的に動きそうになったとき",
    options: opts(
      "一瞬止まれることがある",
      "止まれずに動いてしまうことが多い",
      "相手の顔を見て止まることがある",
      "「これは得策か」と考えて止まる",
    ) },
  { id: "OB-4", category: "OB", kind: "support",
    text: "行動した後で「あのとき感情で動いていた」と振り返れるのは",
    options: opts(
      "よくある。具体的に思い出せる",
      "あまりない",
      "相手から指摘されて気づくことが多い",
      "振り返りの習慣の中で気づく",
    ) },
  { id: "OB-5", category: "OB", kind: "support",
    text: "「本当はこうしたかった」と後から気づくことは",
    options: opts(
      "最近減ってきた",
      "よくある",
      "人間関係の場面でよくある",
      "計画が崩れたときによくある",
    ) },
  // 切り替え自覚
  { id: "SW-1", category: "SW", kind: "core",
    text: "論理で考えるモードと、感覚で動くモードの両方を",
    options: opts(
      "自分の中に感じる・使い分けられる",
      "感覚で動くことがほとんど",
      "場の空気に合わせることがほとんど",
      "論理で考えることがほとんど",
    ) },
  { id: "SW-2", category: "SW", kind: "core",
    text: "状況によって自分の動き方が変わることを",
    options: opts(
      "自覚している",
      "あまり意識しない",
      "相手によって変わると感じる",
      "目的によって変えている",
    ) },
  { id: "SW-3", category: "SW", kind: "support",
    text: "「今は感情より論理で判断すべき場面だ」という判断は",
    options: opts(
      "できることがある",
      "感情より論理を優先したことがない",
      "場の空気を読んで使い分ける",
      "基本的に論理で判断している",
    ) },
  { id: "SW-4", category: "SW", kind: "support",
    text: "「今は分析より直感を信じていい」という判断は",
    options: opts(
      "できることがある",
      "直感はいつも信じている",
      "人間関係の場面では感覚を使う",
      "分析なしに直感を信じることはない",
    ) },
  { id: "SW-5", category: "SW", kind: "support",
    text: "自分の反応パターンは",
    options: opts(
      "ある程度予測できる",
      "その都度、感情次第だ",
      "相手や場によって変わる",
      "論理的に説明できる",
    ) },
];

// ============================================================
// G3: 責任感の3形態(9問)
// ============================================================
export const RESPONSIBILITY_QUESTIONS: DiagnosticQuestion[] = [
  { id: "DR-1", category: "DR", kind: "core",
    text: "ルールや約束を守ることは",
    options: opts(
      "状況に関わらず重要だ",
      "感情的にそうしたいと思う",
      "相手への誠実さとして守る",
      "結果のために守ることが多い",
    ) },
  { id: "DR-2", category: "DR", kind: "core",
    text: "決めたことを最後まで実行することが",
    options: opts(
      "責任だと考える",
      "自分への約束として大切だ",
      "信頼関係を守ることだ",
      "成果を出す手段だ",
    ) },
  { id: "DR-3", category: "DR", kind: "core",
    text: "手順やプロセスが正しければ",
    options: opts(
      "結果が予想外でも問題ないと思える",
      "それだけでは満足できない",
      "チームが安心できるから大切だ",
      "状況によって判断が変わる",
    ) },
  { id: "BR-1", category: "BR", kind: "core",
    text: "頼まれたことは",
    options: opts(
      "できる限り断らないようにしている",
      "自分がやりたいかどうかで決める",
      "優先度と根拠で判断する",
      "その場の状況で判断する",
    ) },
  { id: "BR-2", category: "BR", kind: "core",
    text: "期待されていると感じると",
    options: opts(
      "応えなければという気持ちが強くなる",
      "やる気が上がる・燃える",
      "プレッシャーを感じる",
      "客観的な指標として受け取る",
    ) },
  { id: "BR-3", category: "BR", kind: "core",
    text: "自分の仕事が誰かの役に立っていると感じると",
    options: opts(
      "それが一番の原動力になる",
      "成果の実感として嬉しい",
      "仕事の意義として確認できる",
      "当然のことだと感じる",
    ) },
  { id: "AR-1", category: "AR", kind: "core",
    text: "自分がやると決めたことは",
    options: opts(
      "誰に言われなくてもやり切る",
      "期待に応えるためにやり切る",
      "計画通りに実行する",
      "状況次第で変更することもある",
    ) },
  { id: "AR-2", category: "AR", kind: "core",
    text: "成果が出なければ",
    options: opts(
      "ルールを守っていても意味がないと思う",
      "期待に応えられなかったと感じる",
      "プロセスを振り返って改善する",
      "原因を分析して次に活かす",
    ) },
  { id: "AR-3", category: "AR", kind: "core",
    text: "責任を感じるのは",
    options: opts(
      "自分が心から関わりたいと思っている仕事だ",
      "誰かに必要とされている仕事だ",
      "役割として明確に定義された仕事だ",
      "成果が見える仕事だ",
    ) },
];

// ============================================================
// G5: 組織毀損プロファイル(9問・内部用途)
// ============================================================
export const ORG_RISK_QUESTIONS: DiagnosticQuestion[] = [
  // 承認略奪型
  { id: "AG-1", category: "AG", kind: "core",
    text: "自分の成果が正当に評価されていないと感じることは",
    options: opts(
      "よくある",
      "たまにある",
      "あまりない",
      "評価より自分の手応えを重視する",
    ) },
  { id: "AG-2", category: "AG", kind: "core",
    text: "うまくいかないとき",
    options: opts(
      "周囲や環境のせいだと感じることがある",
      "自分の感情や判断のせいだと思う",
      "原因を構造的に分析する",
      "次にどう動くかを考える",
    ) },
  { id: "AG-3", category: "AG", kind: "core",
    text: "自分より評価されている人を見ると",
    options: opts(
      "腑に落ちないことがある",
      "刺激を受ける",
      "学べることがあるか関心が湧く",
      "客観的な評価として受け取る",
    ) },
  // ルール暴力型
  { id: "RV-1", category: "RV", kind: "core",
    text: "感情論で話す人と議論するのは",
    options: opts(
      "時間の無駄だと思う",
      "感情の背景を理解しようとする",
      "状況を読んで対応を変える",
      "論点を整理して提示する",
    ) },
  { id: "RV-2", category: "RV", kind: "core",
    text: "ルールや論理に従わない人には",
    options: opts(
      "はっきり指摘すべきだと思う",
      "なぜそうするか理解しようとする",
      "状況を読んでから対処する",
      "根拠を示して説得する",
    ) },
  { id: "RV-3", category: "RV", kind: "core",
    text: "正しいことを言っているのに受け入れられないとき",
    options: opts(
      "相手の理解力・姿勢を疑う",
      "感情的に苛立つ",
      "「なぜ伝わらないか」を読もうとする",
      "自分の伝え方を振り返る",
    ) },
  // 衝動暴走型
  { id: "IM-1", category: "IM", kind: "core",
    text: "怒りや不満が",
    options: opts(
      "思っていたより強く出て後悔することがある",
      "強く出るが後悔はしない",
      "出るが相手の反応を見て調整する",
      "出ても論理で制御できる",
    ) },
  { id: "IM-2", category: "IM", kind: "core",
    text: "気分によって同じ人・同じ仕事への態度が変わることは",
    options: opts(
      "よくある",
      "感情に正直なだけだ",
      "相手の態度によって変わる",
      "ほぼない",
    ) },
  { id: "IM-3", category: "IM", kind: "core",
    text: "感情が高ぶると",
    options: opts(
      "言ってはいけないことを言ってしまうことがある",
      "強いエネルギーとして使える",
      "場の空気が壊れないか気になる",
      "論理で制御できる",
    ) },
];

// ============================================================
// セクション定義
// ============================================================
export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  questions: DiagnosticQuestion[];
  field: "axis" | "aSeparation" | "integration" | "responsibility" | "orgRisk";
}

export const QUESTION_SECTIONS: QuestionSection[] = [
  {
    id: "axis",
    title: "Section 1: 4軸の傾向(32問)",
    description: "判断や行動の傾向を、4つの軸から測定します",
    questions: AXIS_QUESTIONS,
    field: "axis",
  },
  {
    id: "aSeparation",
    title: "Section 2: 感情の内的発生と外的表出(10問)",
    description: "「一人でいるとき」と「外に出すとき」の感情を分離して測定します",
    questions: A_SEPARATION_QUESTIONS,
    field: "aSeparation",
  },
  {
    id: "integration",
    title: "Section 3: 切り替えと自己観察(10問)",
    description: "感情と理性のモードを切り替えられる感覚を測定します",
    questions: INTEGRATION_QUESTIONS,
    field: "integration",
  },
  {
    id: "responsibility",
    title: "Section 4: 責任感の形(9問)",
    description: "あなたが感じる責任感の起源を見ます",
    questions: RESPONSIBILITY_QUESTIONS,
    field: "responsibility",
  },
  {
    id: "orgRisk",
    title: "Section 5: 組織内での反応傾向(9問)",
    description: "ストレス下や評価場面での反応パターンを確認します",
    questions: ORG_RISK_QUESTIONS,
    field: "orgRisk",
  },
];

// ============================================================
// 5感情自己評価(各1-5、別ステップ)
// ============================================================
export const EMOTION_QUESTIONS: { key: EmotionKey; text: string }[] = [
  { key: "fear", text: "現在、どの程度「不安」を感じていますか?" },
  { key: "sadness", text: "現在、どの程度「悲しみ」を感じていますか?" },
  { key: "anger", text: "現在、どの程度「怒り」を感じていますか?" },
  { key: "joy", text: "現在、どの程度「喜び」を感じていますか?" },
  { key: "happiness", text: "現在、どの程度「幸福」を感じていますか?" },
];

// 旧 Q1-Q9 互換性のため残す(廃止予定)
export const QUESTIONS = AXIS_QUESTIONS;
