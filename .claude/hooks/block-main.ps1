# main ブランチの上での git commit / git push を止めるフック
# Claude Code がコマンドを実行する前に呼ばれる。終了コード 2 で止めると、理由が Claude に伝わる。
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$data = [Console]::In.ReadToEnd() | ConvertFrom-Json
$command = $data.tool_input.command
if (-not $command) { exit 0 }

# main へ直接プッシュするコマンドは、どのブランチにいても止める
if ($command -match 'git\s+push\b.*\s(\S+:)?main\b') {
    [Console]::Error.WriteLine('main へ直接プッシュすることは禁止されています。作業ブランチをプッシュして PR を作ってください（CLAUDE.md 参照）。')
    exit 2
}

# git commit / git push のコマンドでなければ何もしない
if ($command -notmatch '(^|[;&|(]\s*)git(\s+-C\s+\S+)?\s+(commit|push)\b') { exit 0 }

$dir = $data.cwd
if (-not $dir) { $dir = (Get-Location).Path }
$branch = git -C $dir branch --show-current 2>$null
if ($branch -eq 'main') {
    [Console]::Error.WriteLine('main ブランチの上で commit / push することは禁止されています。Issue を作り、作業ブランチに切り替えてください（CLAUDE.md 参照）。')
    exit 2
}
exit 0
