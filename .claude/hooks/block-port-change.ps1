# サーバーを決められたポート以外で起動するコマンドを止めるフック
# 決められたポート: 画面（Vite）5173、API（Spring Boot）8080、DB（PostgreSQL）5432
# 使用中のときは、使っているプロセスを止めてから決められたポートで起動する（CLAUDE.md 参照）。
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$data = [Console]::In.ReadToEnd() | ConvertFrom-Json
$command = $data.tool_input.command
if (-not $command) { exit 0 }

# git / gh（コミットや PR の文章に起動コマンドが書かれていることがある）は対象外
if ($command -match '^\s*(git|gh)\s') { exit 0 }

# サーバーを起動するコマンドでなければ何もしない
if ($command -notmatch '(npm\s+(run\s+)?(dev|start|preview)|npx\s+vite|\bvite\b|bootRun|gradlew|java\s+.*-jar|docker\s+(compose|run))') { exit 0 }

# ポートを変える指定（--port / -p / server.port / PORT 環境変数 / strictPort を外す）があれば止める
$patterns = @(
    '--port\b',
    '--strictPort[=\s]+false',
    'server\.port',
    'SERVER_PORT',
    '(\$env:|\b)PORT\s*=',
    'docker\s+run\b.*\s-p\s'
)
foreach ($p in $patterns) {
    if ($command -match $p) {
        [Console]::Error.WriteLine('決められたポート以外での起動は禁止されています（画面 5173・API 8080・DB 5432）。ポートが使用中なら、使っているプロセスを確認して止めてから、決められたポートで起動してください（CLAUDE.md 参照）。')
        exit 2
    }
}
exit 0
