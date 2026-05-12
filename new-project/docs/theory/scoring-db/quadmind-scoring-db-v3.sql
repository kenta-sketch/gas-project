-- QuadMind Scoring Database v3.0
-- is_neutral と is_diagnostic_null の2種類に分離
-- © BRAIN JUICE 2026

CREATE TABLE quadmind_scoring (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id         TEXT    NOT NULL,
  option              TEXT    NOT NULL,
  primary_axis        TEXT,
  target_axis         TEXT    NOT NULL,
  target_credit       REAL    NOT NULL DEFAULT 0,
  low_evidence        REAL    NOT NULL DEFAULT 0,
  weight              REAL    NOT NULL DEFAULT 1.0,
  is_reverse          INTEGER NOT NULL DEFAULT 0,
  is_observer         INTEGER NOT NULL DEFAULT 0,
  is_neutral          INTEGER NOT NULL DEFAULT 0,
  is_diagnostic_null  INTEGER NOT NULL DEFAULT 0,
  -- 制約：is_neutral と is_diagnostic_null は排他
  CHECK (NOT (is_neutral = 1 AND is_diagnostic_null = 1))
);

-- ================================================================
-- フィールド定義
-- ================================================================
-- is_neutral = 1
--   → Neutral Frequency にのみ加算
--   → Primary Axis加算なし、Low Evidence加算なし
--   → 例：「特に何も来ない」「状況による」「あまり意識したことがない」
--
-- is_diagnostic_null = 1
--   → Primary Axis加算なし
--   → Low Evidence には加算する（抑制・回避の痕跡として記録）
--   → 例：「感情を出す機会がほとんどない」(eA-3d)= A表出の低証拠
-- ================================================================

INSERT INTO quadmind_scoring VALUES (NULL,'iA-1','a','A','iA',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-1','b','D','iA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-1','c','B','iA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-1','d',NULL,'iA',0,0,1.5,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-2','a','A','iA',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-2','b','D','iA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-2','c','B','iA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-2','d',NULL,'iA',0,0,1.5,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-3','a','A','iA',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-3','b','D','iA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-3','c','B','iA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-3','d',NULL,'iA',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-4','a','A','iA',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-4','b','D','iA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-4','c','B','iA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-4','d',NULL,'iA',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-5','a','A','iA',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-5','b','D','iA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-5','c','B','iA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'iA-5','d',NULL,'iA',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-1','a','A','eA',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-1','b','D','eA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-1','c','B','eA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-1','d',NULL,'eA',0,0,1.5,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-2','a','A','eA',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-2','b','D','eA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-2','c','B','eA',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-2','d',NULL,'eA',0,0,1.5,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-3','a','A','eA',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-3','b','D','eA',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-3','c','B','eA',0,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-3','d',NULL,'eA',0,1,1,1,0,0,1);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-4','a','A','eA',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-4','b','D','eA',0.5,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-4','c','B','eA',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-4','d',NULL,'eA',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-5','a','A','eA',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-5','b','D','eA',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-5','c','B','eA',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'eA-5','d',NULL,'eA',0,0,1,1,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-1','a','FZ','FZ',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-1','b','FZ','FZ',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-1','c',NULL,'FZ',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-1','d','D','FZ',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-2','a','FZ','FZ',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-2','b','FZ','FZ',0.5,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-2','c',NULL,'FZ',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'FZ-2','d',NULL,'FZ',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-1','a','A','A',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-1','b','B','A',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-1','c','C','A',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-1','d','D','A',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-2','a','A','A',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-2','b','B','A',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-2','c','C','A',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-2','d','D','A',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-3','a','A','A',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-3','b','B','A',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-3','c','C','A',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-3','d','D','A',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-4','a','A','A',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-4','b','B','A',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-4','c','C','A',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-4','d','D','A',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-5','a','A','A',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-5','b','B','A',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-5','c','C','A',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-5','d','D','A',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-6','a','A','A',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-6','b','B','A',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-6','c','C','A',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-6','d','D','A',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-7','a','A','A',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-7','b','B','A',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-7','c','C','A',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-7','d','D','A',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-8','a','A','A',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-8','b','B','A',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-8','c','C','A',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'A-8','d','D','A',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-1','a','B','B',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-1','b','A','B',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-1','c','D','B',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-1','d','C','B',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-2','a','B','B',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-2','b','A','B',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-2','c','C','B',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-2','d','D','B',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-3','a','B','B',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-3','b','A','B',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-3','c','C','B',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-3','d','D','B',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-4','a','B','B',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-4','b','A','B',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-4','c','C','B',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-4','d','D','B',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-5','a','B','B',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-5','b','A','B',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-5','c','C','B',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-5','d','D','B',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-6','a','B','B',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-6','b','A','B',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-6','c','C','B',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-6','d','D','B',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-7','a','A','B',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-7','b','B','B',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-7','c','C','B',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-7','d','D','B',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-8','a','A','B',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-8','b','B','B',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-8','c','C','B',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'B-8','d','D','B',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-1','a','C','C',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-1','b','A','C',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-1','c','B','C',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-1','d','D','C',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-2','a','C','C',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-2','b','A','C',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-2','c','B','C',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-2','d','D','C',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-3','a','C','C',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-3','b','A','C',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-3','c','B','C',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-3','d','D','C',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-4','a','C','C',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-4','b','A','C',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-4','c','B','C',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-4','d','D','C',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-5','a','C','C',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-5','b','A','C',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-5','c','B','C',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-5','d','D','C',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-6','a','C','C',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-6','b','A','C',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-6','c','B','C',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-6','d','D','C',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-7','a','D','C',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-7','b','C','C',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-7','c','A','C',0,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-7','d','B','C',0,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-8','a','C','C',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-8','b','A','C',0,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-8','c','B','C',0,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'C-8','d','D','C',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-1','a','D','D',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-1','b','A','D',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-1','c','B','D',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-1','d','C','D',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-2','a','D','D',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-2','b','A','D',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-2','c','B','D',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-2','d','C','D',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-3','a','D','D',1,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-3','b','A','D',0,0.5,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-3','c','B','D',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-3','d','C','D',0,0,1.5,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-4','a','D','D',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-4','b','A','D',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-4','c','B','D',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-4','d','C','D',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-5','a','D','D',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-5','b','A','D',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-5','c','B','D',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-5','d','C','D',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-6','a','D','D',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-6','b','A','D',0,0.5,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-6','c','B','D',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-6','d','C','D',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-7','a','A','D',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-7','b','C','D',0.5,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-7','c','B','D',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-7','d','D','D',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-8','a','A','D',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-8','b','B','D',0,1,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-8','c','C','D',0,0.5,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'D-8','d','D','D',1,0,1,1,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-1','a','OB','OB',1,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-1','b','A','OB',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-1','c','B','OB',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-1','d','D','OB',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-2','a','OB','OB',1,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-2','b','A','OB',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-2','c','B','OB',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-2','d','D','OB',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-3','a','OB','OB',1,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-3','b','A','OB',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-3','c','B','OB',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-3','d','D','OB',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-4','a','OB','OB',1,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-4','b','A','OB',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-4','c','B','OB',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-4','d','D','OB',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-5','a','OB','OB',1,0,1,1,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-5','b','A','OB',0,1,1,1,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-5','c','B','OB',0,0.5,1,1,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'OB-5','d','D','OB',0,0.5,1,1,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-1','a','OB','SW',1,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-1','b','A','SW',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-1','c','B','SW',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-1','d','D','SW',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-2','a','OB','SW',1,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-2','b','A','SW',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-2','c','B','SW',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-2','d','D','SW',0,0,1.5,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-3','a','OB','SW',1,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-3','b','A','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-3','c','B','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-3','d','D','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-4','a','OB','SW',1,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-4','b','A','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-4','c','B','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-4','d','D','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-5','a','OB','SW',1,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-5','b','A','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-5','c','B','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'SW-5','d','D','SW',0,0,1,0,1,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-1','a','DR','DR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-1','b','AR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-1','c','BR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-1','d','AR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-2','a','DR','DR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-2','b','AR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-2','c','BR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-2','d','AR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-3','a','DR','DR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-3','b','AR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-3','c','BR','DR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'DR-3','d',NULL,'DR',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-1','a','BR','BR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-1','b','AR','BR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-1','c','DR','BR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-1','d',NULL,'BR',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-2','a','BR','BR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-2','b','AR','BR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-2','c','BR','BR',0.5,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-2','d','DR','BR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-3','a','BR','BR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-3','b','AR','BR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-3','c','DR','BR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'BR-3','d',NULL,'BR',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-1','a','AR','AR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-1','b','BR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-1','c','DR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-1','d',NULL,'AR',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-2','a','AR','AR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-2','b','BR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-2','c','DR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-2','d','DR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-3','a','AR','AR',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-3','b','BR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-3','c','DR','AR',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AR-3','d','AR','AR',0.5,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-1','a','AG','AG',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-1','b',NULL,'AG',0.5,0,1,0,0,0,1);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-1','c',NULL,'AG',0,0,1,0,0,1,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-1','d','A','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-2','a','AG','AG',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-2','b','A','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-2','c','D','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-2','d','C','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-3','a','AG','AG',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-3','b','A','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-3','c','C','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'AG-3','d','D','AG',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-1','a','RV','RV',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-1','b','B','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-1','c','C','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-1','d','D','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-2','a','RV','RV',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-2','b','B','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-2','c','C','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-2','d','D','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-3','a','RV','RV',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-3','b','A','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-3','c','C','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'RV-3','d','D','RV',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-1','a','IM','IM',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-1','b','A','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-1','c','B','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-1','d','D','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-2','a','IM','IM',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-2','b','A','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-2','c','B','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-2','d','D','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-3','a','IM','IM',1,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-3','b','A','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-3','c','B','IM',0,0,1,0,0,0,0);
INSERT INTO quadmind_scoring VALUES (NULL,'IM-3','d','D','IM',0,0,1,0,0,0,0);

-- ================================================================
-- 採点エンジン実装クエリ v3.0
-- ================================================================

-- ① Axis Score（本人向け）
-- SELECT target_axis,
--   ROUND(25.0 * SUM(weight * target_credit) / maxv.m, 2) AS axis_score
-- FROM quadmind_scoring
-- JOIN (SELECT target_axis t, SUM(weight) m FROM quadmind_scoring
--       WHERE is_observer=0 AND target_credit>0 GROUP BY target_axis) maxv
--   ON target_axis = maxv.t
-- WHERE is_observer=0 AND target_credit>0
-- GROUP BY target_axis;

-- ② Preference Score（反応スタイル）
-- SELECT primary_axis, ROUND(SUM(weight),2) AS pref
-- FROM quadmind_scoring
-- WHERE is_observer=0 AND primary_axis IS NOT NULL
--   AND is_neutral=0
-- GROUP BY primary_axis ORDER BY pref DESC;

-- ③ Low Evidence Index（内部判定）
-- ☆ is_neutral=1 は除外、is_diagnostic_null=1 は含む
-- SELECT target_axis,
--   ROUND(25.0 * SUM(weight * low_evidence) / maxle.m, 2) AS lei
-- FROM quadmind_scoring
-- JOIN (SELECT target_axis t, SUM(weight * low_evidence) m
--       FROM quadmind_scoring WHERE low_evidence>0 AND is_neutral=0
--       GROUP BY target_axis) maxle ON target_axis = maxle.t
-- WHERE low_evidence > 0 AND is_neutral = 0
-- GROUP BY target_axis;

-- ④ Neutral Frequency
-- SELECT COUNT(*) AS neutral_count,
--   ROUND(100.0*COUNT(*)/(SELECT COUNT(*) FROM quadmind_scoring),1) AS pct
-- FROM quadmind_scoring WHERE is_neutral=1;

-- ⑤ Diagnostic Null（is_diagnostic_null の追跡）
-- SELECT question_id, option, target_axis, low_evidence
-- FROM quadmind_scoring WHERE is_diagnostic_null=1;
