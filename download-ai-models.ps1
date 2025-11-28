# AI Background Removal Tool - Model Download Script (Windows PowerShell)
# Usage: Run .\download-ai-models.ps1 in project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Background Removal - Model Downloader" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create directories
$modelsDir = "public\ai-tools\background-removal\models"
Write-Host "[1/3] Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
Write-Host "Done: $modelsDir" -ForegroundColor Green
Write-Host ""

# Download main library
Write-Host "[2/3] Downloading main library..." -ForegroundColor Yellow
$mainLibUrl = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.5/dist/imgly-background-removal.umd.min.js"
$mainLibPath = "public\ai-tools\background-removal\imgly-background-removal.umd.min.js"

try {
    Write-Host "  Downloading: imgly-background-removal.umd.min.js" -ForegroundColor Gray
    Invoke-WebRequest -Uri $mainLibUrl -OutFile $mainLibPath -UseBasicParsing
    $fileSize = (Get-Item $mainLibPath).Length / 1KB
    Write-Host "  Done ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
} catch {
    Write-Host "  Failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Download model files
Write-Host "[3/3] Downloading AI model files (about 80MB, please wait)..." -ForegroundColor Yellow
$baseUrl = "https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.0.6/dist/"
$files = @(
    "ort-wasm-simd-threaded.wasm",
    "ort-wasm-simd.wasm",
    "ort-wasm-threaded.wasm",
    "ort-wasm.wasm",
    "model.onnx"
)

$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    Write-Host "  [$currentFile/$totalFiles] Downloading: $file" -ForegroundColor Gray

    try {
        $filePath = Join-Path $modelsDir $file
        Invoke-WebRequest -Uri "$baseUrl$file" -OutFile $filePath -UseBasicParsing

        $fileSize = (Get-Item $filePath).Length
        if ($fileSize -gt 1MB) {
            $sizeStr = "$([math]::Round($fileSize / 1MB, 2)) MB"
        } else {
            $sizeStr = "$([math]::Round($fileSize / 1KB, 2)) KB"
        }

        Write-Host "       Done ($sizeStr)" -ForegroundColor Green
    } catch {
        Write-Host "       Failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Tips if download fails:" -ForegroundColor Yellow
        Write-Host "  1. Check network connection" -ForegroundColor Yellow
        Write-Host "  2. Use VPN if needed" -ForegroundColor Yellow
        Write-Host "  3. Manual download from:" -ForegroundColor Yellow
        Write-Host "     $baseUrl$file" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All files downloaded successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files saved to:" -ForegroundColor Cyan
Write-Host "  - Library: public\ai-tools\background-removal\imgly-background-removal.umd.min.js" -ForegroundColor Gray
Write-Host "  - Models: public\ai-tools\background-removal\models\" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update tool code in admin panel" -ForegroundColor Gray
Write-Host "  2. Change CDN links to local paths" -ForegroundColor Gray
Write-Host "  3. Test the tool" -ForegroundColor Gray
Write-Host ""
