-- QMT診断結果の中央保存テーブル(v3.0 30問体系〜)
-- 適用先: kenta-sketch's Project (kgeeejyrcpethghuneix)
-- 適用方法: Supabase ダッシュボード → SQL Editor にこのファイルの中身を貼り付けて Run

create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- クライアント側で発行される診断ID(localStorage側と突合用)
  client_diagnosis_id text,
  -- 質問セットのバージョン("v3.0-30q" など)
  version text not null default 'v3.0-30q',
  -- 回答者プロフィール(氏名・年代・性別・文脈)
  profile jsonb not null,
  -- 4軸スコア {A,B,C,D}
  scores jsonb not null,
  -- 5感情 {fear,sadness,anger,joy,happiness}
  emotions jsonb not null,
  -- タイプ判定(内部名: A抑圧型 等)
  quad_type text not null,
  -- DiagnosticResult 全体(bSeparation/conflict/alliances/platform 等を含む)
  result jsonb not null,
  -- 生の回答(閾値の再較正用に必須)
  answers jsonb,
  -- AI個別分析(生成済みならキャッシュ)
  personal_insight jsonb
);

-- RLS: 有効化し、anonからのアクセスは全て遮断(service_role経由のみ)
alter table public.diagnoses enable row level security;

-- 集計用インデックス
create index diagnoses_created_at_idx on public.diagnoses (created_at desc);
create index diagnoses_quad_type_idx on public.diagnoses (quad_type);
