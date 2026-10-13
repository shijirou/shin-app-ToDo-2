-- テストデータ（アプリの起動時に毎回実行される）
-- 最初に中身を空にして、id の連番も 1 に戻す（何度起動しても同じデータになる）
TRUNCATE cards, lists RESTART IDENTITY CASCADE;

INSERT INTO lists (name, position, created_at, updated_at) VALUES
  ('ToDo',   0, now(), now()),
  ('進行中', 1, now(), now()),
  ('完了',   2, now(), now());

INSERT INTO cards (list_id, content, position, created_at, updated_at) VALUES
  (1, '買い物に行く',       0, now(), now()),
  (1, '部屋を掃除する',     1, now(), now()),
  (2, 'レポートを書く',     0, now(), now()),
  (2, 'Spring Boot の勉強', 1, now(), now()),
  (3, '要件定義を作る',     0, now(), now());
