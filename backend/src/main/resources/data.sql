-- テストデータ（アプリの起動時に毎回実行される）
-- lists テーブルが空のときだけ、リスト3件とカード5件を入れる。
-- データが1件でもあれば何もしないので、API で追加・変更したデータは起動し直しても残る。
-- （リストを入れるとき、自動で付いた id を受け取り、その id を使ってカードを入れている）
WITH new_lists AS (
  INSERT INTO lists (name, position, created_at, updated_at)
  SELECT v.name, v.position, now(), now()
  FROM (VALUES ('ToDo', 0), ('進行中', 1), ('完了', 2)) AS v(name, position)
  WHERE NOT EXISTS (SELECT 1 FROM lists)
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
