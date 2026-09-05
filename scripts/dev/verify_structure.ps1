# Verify all expected QueueCut directories exist
$expected = @(
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
    "data/raw/manual_observations",
    "data/interim/cleaned_weather_cache",
    "data/processed/static_json",
    "data/processed/ml_ready",
    "data/external",
    "data/seed",
    "data/schemas/validation_contracts",
    "data/validation",
    "ml/notebooks",
    "ml/src/features",
    "ml/src/models",
    "ml/src/evaluation",
    "ml/src/pipelines",
    "ml/artifacts/encoders",
    "ml/artifacts/models",
    "ml/reports",
    "scripts/dev",
    "scripts/data",
    "scripts/db",
    "scripts/release",
    "docs/architecture",
    "docs/api",
    "docs/data",
    "docs/ml",
    "docs/product",
    "docs/ux",
    "docs/testing",
    "docs/security",
    "docs/deployment",
    "infra/docker",
    "infra/vercel",
    "infra/firebase",
    "infra/github/ISSUE_TEMPLATE",
    "config",
    "storage/uploads",
    "storage/logs",
    "storage/cache",
    ".github/workflows"
)

$missing = @()
foreach ($p in $expected) {
    if (-not (Test-Path -Path $p)) {
        $missing += $p
    }
}

if ($missing.Count -eq 0) {
    Write-Host "SUCCESS: All $($expected.Count) expected directories exist and are verified!" -ForegroundColor Green
} else {
    Write-Host "FAILURE: Missing $($missing.Count) directories:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    exit 1
}
