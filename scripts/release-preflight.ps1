$ErrorActionPreference = "Stop"
$ProjectPath = Split-Path $PSScriptRoot -Parent

function Pass($message) {
  Write-Host "[PASS] $message" -ForegroundColor Green
}

function Warn($message) {
  Write-Host "[WARN] $message" -ForegroundColor Yellow
}

function Fail($message) {
  Write-Host "[FAIL] $message" -ForegroundColor Red
  $script:Failed = $true
}

$script:Failed = $false

$appJsonPath = Join-Path $ProjectPath "app.json"
$packageJsonPath = Join-Path $ProjectPath "package.json"
$easJsonPath = Join-Path $ProjectPath "eas.json"

try {
  $app = Get-Content $appJsonPath -Raw | ConvertFrom-Json
  Pass "app.json is valid JSON"
} catch {
  Fail "app.json is invalid JSON"
}

try {
  $package = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
  Pass "package.json is valid JSON"
} catch {
  Fail "package.json is invalid JSON"
}

try {
  $eas = Get-Content $easJsonPath -Raw | ConvertFrom-Json
  Pass "eas.json is valid JSON"
} catch {
  Fail "eas.json is missing or invalid"
}

if ($app.expo.version -eq "1.0.0") {
  Pass "App version is 1.0.0"
} else {
  Warn "App version is $($app.expo.version), expected 1.0.0 for this RC"
}

if ($app.expo.android.versionCode -ge 1) {
  Pass "Android versionCode is configured"
} else {
  Fail "Android versionCode is missing"
}

if ($app.expo.android.package) {
  Pass "Android package is $($app.expo.android.package)"
} else {
  Fail "Android package is missing"
}

$requiredAssets = @(
  "assets\images\icon.png",
  "assets\images\android-icon-foreground.png",
  "assets\images\android-icon-background.png",
  "assets\images\android-icon-monochrome.png",
  "assets\images\splash-icon.png",
  "assets\images\favicon.png",
  "assets\videos\launch_intro.mp4"
)

foreach ($asset in $requiredAssets) {
  if (Test-Path (Join-Path $ProjectPath $asset)) {
    Pass "Asset exists: $asset"
  } else {
    Fail "Missing asset: $asset"
  }
}

$forbiddenRoutes = @(
  "src\app\beta-feedback.tsx",
  "src\app\launch-candidate.tsx",
  "src\app\sync-diagnostics.tsx"
)

foreach ($route in $forbiddenRoutes) {
  if (Test-Path (Join-Path $ProjectPath $route)) {
    Fail "Internal route still exists: $route"
  } else {
    Pass "Internal route absent: $route"
  }
}

if ($eas.build.preview.android.buildType -eq "apk") {
  Pass "Preview profile builds APK"
} else {
  Fail "Preview APK profile is not configured"
}

if ($eas.build.production.android.buildType -eq "app-bundle") {
  Pass "Production profile builds AAB"
} else {
  Fail "Production AAB profile is not configured"
}

if ($script:Failed) {
  Write-Host ""
  throw "Viora release preflight failed. Fix the FAIL items before building."
}

Write-Host ""
Write-Host "Viora release preflight passed." -ForegroundColor Green
Write-Host "Build preview APK: eas build --platform android --profile preview"
Write-Host "Build production AAB: eas build --platform android --profile production"
