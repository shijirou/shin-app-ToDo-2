-- テストデータ（アプリの起動時に毎回実行される）
-- 見本のリスト3件とカード5件は、最初の1回だけ入れる。
-- 入れたら seed_history テーブルに印を残し、次からは何もしない。
-- そのため、リストを全部消してから起動し直しても、見本は戻ってこない。

-- 1. 「見本を入れたか」の印を残す表（なければ作る）
CREATE TABLE IF NOT EXISTS seed_history (
  name VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. 印がなく、リストも空のときだけ見本を入れる
-- （リストを入れるとき、自動で付いた id を受け取り、その id を使ってカードを入れている）
WITH new_lists AS (
  INSERT INTO lists (name, position, created_at, updated_at)
  SELECT v.name, v.position, now(), now()
  FROM (VALUES ('ToDo', 0), ('進行中', 1), ('完了', 2)) AS v(name, position)
  WHERE NOT EXISTS (SELECT 1 FROM seed_history WHERE name = 'sample-board')
    AND NOT EXISTS (SELECT 1 FROM lists)
  RETURNING id, name
)
INSERT INTO cards (list_id, content, position, created_at, updated_at)
SELECT nl.id, c.content, c.position, now(), now()
FROM new_lists nl
JOIN (VALUES
  ('ToDo',   '買い物に行く',       0),
  ('ToDo',   '部屋を掃除する',     1),
  ('進行中', 'レポートを書く',     0),
  ('進行中', 'Spring Boot の勉強', 1),
  ('完了',   '要件定義を作る',     0)
) AS c(list_name, content, position) ON c.list_name = nl.name;

-- 3. 印を残す（すでにあれば何もしない）。
-- この仕組みを入れる前から使っている DB も、ここで印が付くので、見本が二重に入ることはない
INSERT INTO seed_history (name) VALUES ('sample-board') ON CONFLICT (name) DO NOTHING;
