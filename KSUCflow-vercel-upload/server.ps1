# Starts the RouteFlow prototype at http://localhost:8080 using Windows PowerShell.
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8080/')
$contentRoot = $PSScriptRoot
$mimeTypes = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml'; '.ico'='image/x-icon' }

try {
    $listener.Start()
    Write-Host 'RouteFlow is running at http://localhost:8080' -ForegroundColor Green
    Write-Host 'Press Ctrl+C to stop the server.' -ForegroundColor Yellow
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $requestPath = $context.Request.Url.AbsolutePath
        if ($requestPath -eq '/') { $requestPath = '/index.html' }
        $relativePath = $requestPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        $filePath = [IO.Path]::GetFullPath((Join-Path $contentRoot $relativePath))
        if (-not $filePath.StartsWith($contentRoot, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
            $context.Response.StatusCode = 404
            $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
        } else {
            $context.Response.StatusCode = 200
            $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $context.Response.ContentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
            $bytes = [IO.File]::ReadAllBytes($filePath)
        }
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
    }
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
