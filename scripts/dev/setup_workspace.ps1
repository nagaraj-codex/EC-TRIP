# QueueCut Workspace Initialization Script
# Automatically creates the project directory tree and optional .gitkeep files

param (
    [string]$RootPath = $PSScriptRoot,
    [switch]$AddGitKeep = $true
)

$ErrorActionPreference = "Stop"

Write-Host "Initializing QueueCut workspace at: $RootPath" -ForegroundColor Cyan

$directories = @(
    # apps/web
    "apps/web/public/assets/maps",
    "apps/web/src/assets/fonts",
    "apps/web/src/assets/icons",
    "apps/web/src/assets/images",
    "apps/web/src/components/atoms",
    "apps/web/src/components/molecules",
    "apps/web/src/components/organisms",
    "apps/web/src/components/layout",
    "apps/web/src/components/recommendation",
    "apps/web/src/components/fasttrack",
    "apps/web/src/components/weather",
    "apps/web/src/components/feedback",
    "apps/web/src/features/home",
    "apps/web/src/features/planner",
    "apps/web/src/features/results",
    "apps/web/src/hooks",
    "apps/web/src/services/endpoints",
    "apps/web/src/store/slices",
    "apps/web/src/types",
    "apps/web/src/utils",
    "apps/web/src/styles",
    "apps/web/tests/components",
    "apps/web/tests/hooks",
    "apps/web/tests/utils",
    "apps/web/e2e/user_journeys",

    # apps/api
    "apps/api/app/api/routes",
    "apps/api/app/core",
    "apps/api/app/db/models",
    "apps/api/app/db/repositories",
    "apps/api/app/db/migrations/versions",
    "apps/api/app/schemas",
    "apps/api/app/services/optimization",
    "apps/api/app/services/fasttrack",
    "apps/api/app/services/prediction",
    "apps/api/app/services/weather",
    "apps/api/app/services/calendar",
    "apps/api/app/utils",
    "apps/api/tests/unit",
    "apps/api/tests/integration",

    # data
    "data/raw/manual_observations",
    "data/interim/cleaned_weather_cache",
    "data/processed/static_json",
    "data/processed/ml_ready",
    "data/external",
    "data/seed",
    "data/schemas/validation_contracts",
    "data/validation",

    # ml
    "ml/notebooks",
    "ml/src/features",
    "ml/src/models",
    "ml/src/evaluation",
    "ml/src/pipelines",
    "ml/artifacts/encoders",
    "ml/artifacts/models",
    "ml/reports",

    # scripts
    "scripts/dev",
    "scripts/data",
    "scripts/db",
    "scripts/release",

    # docs
    "docs/architecture",
    "docs/api",
    "docs/data",
    "docs/ml",
    "docs/product",
    "docs/ux",
    "docs/testing",
    "docs/security",
    "docs/deployment",

    # infra
    "infra/docker",
    "infra/vercel",
    "infra/firebase",
    "infra/github/ISSUE_TEMPLATE",

    # config
    "config",

    # storage
    "storage/uploads",
    "storage/logs",
    "storage/cache",

    # .github
    ".github/workflows"
)

$createdDirs = 0
$createdFiles = 0

foreach ($dir in $directories) {
    $fullPath = Join-Path -Path $RootPath -ChildPath $dir
    if (-not (Test-Path -Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        $createdDirs++
    }

    if ($AddGitKeep) {
        $gitkeepPath = Join-Path -Path $fullPath -ChildPath ".gitkeep"
        if (-not (Test-Path -Path $gitkeepPath)) {
            New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
            $createdFiles++
        }
    }
}

Write-Host "Workspace creation complete!" -ForegroundColor Green
Write-Host "Created $createdDirs directories and $createdFiles .gitkeep files." -ForegroundColor Cyan
