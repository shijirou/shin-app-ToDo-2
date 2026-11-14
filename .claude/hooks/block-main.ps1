# main ブランチの上での git commit / git push を止めるフック
# Claude Code がコマンドを実行する前に呼ばれる。終了コード 2 で止めると、理由が Claude に伝わる。
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$data = [Console]::In.ReadToEnd() | ConvertFrom-Json
$command = $data.tool_input.command
if (-not $command) { exit 0 }

# main へ直接プッシュするコマンドか（どのブランチにいても止める。ただし止めるのは、行き先を調べたあと）
$pushMain = $command -match 'git\s+push\b.*\s(\S+:)?main\b'
$pushMainMessage = 'main へ直接プッシュすることは禁止されています。作業ブランチをプッシュして PR を作ってください（CLAUDE.md 参照）。'

# git commit / git push のコマンドでなければ何もしない
$m = [regex]::Match($command, '(^|[;&|(]\s*)git(\s+-C\s+("[^"]+"|''[^'']+''|\S+))?\s+(commit|push)\b')
if (-not $m.Success) {
    # 行き先が読み取れない書き方で main へのプッシュらしいものは、安全側で止める
    if ($pushMain) { [Console]::Error.WriteLine($pushMainMessage); exit 2 }
    exit 0
}

$dir = $data.cwd
if (-not $dir) { $dir = (Get-Location).Path }

# コマンドの行き先を読み取る: git -C <場所>、なければ、その前の cd <場所> のいちばん最後
$target = $null
if ($m.Groups[3].Success) {
    $target = $m.Groups[3].Value
} else {
    $cds = [regex]::Matches($command.Substring(0, $m.Index), '(?:^|[;&|(]\s*)cd\s+("[^"]+"|''[^'']+''|[^\s;&|]+)')
    if ($cds.Count -gt 0) { $target = $cds[$cds.Count - 1].Groups[1].Value }
}

# 行き先を実際のフォルダに直す（読み取れないときは起動フォルダのまま = 安全側）
$checkDir = $dir
if ($target) {
    $t = $target.Trim('"', "'")
    $t = $t -replace '^(~|\$HOME|\$env:USERPROFILE)(?=$|[\\/])', ($env:USERPROFILE -replace '\\', '/')
    $t = $t -replace '^/([a-zA-Z])(?=/|$)', '$1:'
    if (-not [System.IO.Path]::IsPathRooted($t)) { $t = Join-Path $dir $t }
    if (Test-Path -LiteralPath $t -PathType Container) { $checkDir = $t }
}

# 守る対象は、このプロジェクトのリポジトリだけ。行き先が別のリポジトリなら止めない
$projectRoot = git -C $dir rev-parse --show-toplevel 2>$null
$targetRoot = git -C $checkDir rev-parse --show-toplevel 2>$null
if ($projectRoot -and $targetRoot -and ($projectRoot -ine $targetRoot)) { exit 0 }

# このプロジェクトの main へのプッシュは、どのブランチにいても止める
if ($pushMain) { [Console]::Error.WriteLine($pushMainMessage); exit 2 }

$branch = git -C $checkDir branch --show-current 2>$null
if ($branch -eq 'main') {
    [Console]::Error.WriteLine('main ブランチの上で commit / push することは禁止されています。Issue を作り、作業ブランチに切り替えてください（CLAUDE.md 参照）。')
    exit 2
}
exit 0
