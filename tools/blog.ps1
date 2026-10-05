param(
    [ValidateSet('preview', 'stop', 'article', 'publish', 'check', 'login', 'shell')]
    [string]$Action = 'preview'
)

$ErrorActionPreference = 'Stop'
$blogRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $blogRoot
$nodeFolder = Join-Path $blogRoot '.local\node-v22.22.0-win-x64'
$gitFolder = Join-Path $blogRoot '.local\git\cmd'
if (!(Test-Path (Join-Path $nodeFolder 'node.exe')) -or !(Test-Path (Join-Path $gitFolder 'git.exe'))) {
    throw '本地运行环境缺失，请重新准备 .local 中的 Node.js 和 Git。'
}
$env:PATH = "$gitFolder;$nodeFolder;$env:PATH"
$env:GIT_CONFIG_COUNT = '1'
$env:GIT_CONFIG_KEY_0 = 'safe.directory'
$env:GIT_CONFIG_VALUE_0 = $blogRoot.Replace('\', '/')
$npmPath = Join-Path $nodeFolder 'npm.cmd'

# Reuse the existing Windows proxy without changing Windows settings.
$proxySettings = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'
if ($proxySettings.ProxyEnable -eq 1 -and $proxySettings.ProxyServer) {
    $blogProxy = [string]$proxySettings.ProxyServer
    if ($blogProxy.Contains('=')) {
        $proxyParts = @{}
        foreach ($part in $blogProxy.Split(';')) {
            $pair = $part.Split('=', 2)
            if ($pair.Length -eq 2) { $proxyParts[$pair[0]] = $pair[1] }
        }
        if ($proxyParts['https']) { $blogProxy = $proxyParts['https'] }
        else { $blogProxy = $proxyParts['http'] }
    }
    if ($blogProxy -and !$blogProxy.Contains('://')) { $blogProxy = "http://$blogProxy" }
    $env:HTTPS_PROXY = $blogProxy
    $env:HTTP_PROXY = $blogProxy
    $env:npm_config_proxy = $blogProxy
}

switch ($Action) {
    'preview' {
        $previewRunning = $false
        try {
            $page = Invoke-WebRequest 'http://127.0.0.1:4000' -UseBasicParsing -TimeoutSec 2
            $previewRunning = $page.Content -match '<title>Mortal</title>'
        } catch { }
        if ($previewRunning) {
            Start-Process 'http://127.0.0.1:4000'
            Write-Host '博客预览已在运行。保存文章后刷新页面即可。'
        } else {
            $previewNode = Join-Path $nodeFolder 'node.exe'
            $previewProcess = Start-Process -FilePath $previewNode -ArgumentList @('node_modules\hexo\bin\hexo', 'server', '--ip', '127.0.0.1') -WorkingDirectory $blogRoot -WindowStyle Hidden -RedirectStandardOutput '.local\preview.log' -RedirectStandardError '.local\preview-error.log' -PassThru
            $previewProcess.Id | Set-Content '.local\preview.pid'
            for ($attempt = 0; $attempt -lt 40; $attempt++) {
                try {
                    $page = Invoke-WebRequest 'http://127.0.0.1:4000' -UseBasicParsing -TimeoutSec 1
                    $previewRunning = $page.Content -match '<title>Mortal</title>'
                } catch { }
                if ($previewRunning -or $previewProcess.HasExited) { break }
                Start-Sleep -Milliseconds 300
            }
            if (!$previewRunning) { throw '预览启动失败，请检查 .local/preview-error.log 和 4000 端口。' }
            Start-Process 'http://127.0.0.1:4000'
            Write-Host '预览已在后台启动。保存文章后刷新页面；双击 stop-preview.cmd 停止预览。'
        }
    }
    'stop' {
        $previewPidPath = Join-Path $blogRoot '.local\preview.pid'
        if (Test-Path $previewPidPath) {
            $previewPid = [int](Get-Content $previewPidPath)
            $previewProcess = Get-Process -Id $previewPid -ErrorAction SilentlyContinue
            $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $previewPid" -ErrorAction SilentlyContinue
            if ($previewProcess -and $previewProcess.Path -eq (Join-Path $nodeFolder 'node.exe') -and $processInfo.CommandLine -match 'node_modules\\hexo\\bin\\hexo.*server') {
                Stop-Process -Id $previewPid
                Write-Host '博客本地预览已停止。'
            } else { Write-Host '没有找到本工程启动的预览进程。' }
        } else { Write-Host '本工程尚未启动预览。' }
    }
    'article' {
        $articleTitle = Read-Host '请输入文章标题'
        $articleCategory = Read-Host '请输入分类（回车默认：随笔）'
        if (!$articleCategory.Trim()) { $articleCategory = '随笔' }
        & $npmPath run article -- $articleTitle $articleCategory
        if ($LASTEXITCODE -ne 0) { throw '新建文章未完成。' }
    }
    'check' {
        & $npmPath run publish:check
        if ($LASTEXITCODE -ne 0) { throw '发布演练未通过。' }
    }
    'publish' {
        Write-Host '将检查网站、保存源码到 source 分支，再发布生成网页到 main 分支。'
        & $npmPath run publish
        if ($LASTEXITCODE -ne 0) { throw '发布未完成，请查看上面的提示。' }
    }
    'login' {
        Write-Host '请在 GitHub 页面完成登录。mortalkit 和仓库所有者账号均可，需具备此仓库的写权限。'
        git credential-manager github login --browser
        if ($LASTEXITCODE -ne 0) { throw 'GitHub 登录未完成。' }
        git push --dry-run origin HEAD:source
        if ($LASTEXITCODE -ne 0) { throw 'source 分支推送权限检查未通过。' }
        git push --dry-run origin refs/remotes/origin/main:refs/heads/main
        if ($LASTEXITCODE -ne 0) { throw 'main 分支推送权限检查未通过。' }
        Write-Host '登录和两个分支的推送权限检查通过。没有实际上传内容。'
    }
    'shell' {
        Write-Host '当前窗口已准备好 git、node、npm。输入 exit 退出。'
        & powershell.exe -NoProfile -NoExit
    }
}
