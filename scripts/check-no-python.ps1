#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"
$found = $false

$files = git ls-files | Where-Object { $_ -match '\.(py|pyc|pyo|pyd|pyw|pyi|ipynb)$' }
if ($files) {
    Write-Host "ERROR: Found Python files in the repository:" -ForegroundColor Red
    $files | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    $found = $true
}

$references = git ls-files | ForEach-Object {
    if ($_ -ne "scripts/check-no-python.ps1" -and $_ -ne "scripts/check-no-python.sh" -and $_ -ne ".gitignore" -and $_ -notmatch ".vscode") {
        $matches = Select-String -Path $_ -Pattern 'python|pip install|uvicorn|fastapi|flask|django|pydantic|sqlalchemy|alembic|gunicorn|requirements\.txt|venv|\.py\b' -ErrorAction SilentlyContinue
        if ($matches) {
            Write-Host "ERROR: Found Python references in $_" -ForegroundColor Red
            $found = $true
        }
    }
}

if ($found) {
    Write-Host "Python purge failed." -ForegroundColor Red
    exit 1
}

Write-Host "No Python remnants found. Project is clean." -ForegroundColor Green
exit 0
