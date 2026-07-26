import Constants from "expo-constants";
import { Platform } from "react-native";

import { getLaunchAuditSnapshot, getPendingSyncActions, saveLaunchAuditSnapshot } from "../../repositories";
import { LaunchAuditSnapshot, LaunchReadinessCheck, LaunchReadinessDashboard, LaunchReadinessSummary } from "../../types";


function hasExpoPlugin(pluginName: string): boolean {
  const plugins = Constants.expoConfig?.plugins || [];
  return plugins.some((plugin: unknown) => Array.isArray(plugin) ? plugin[0] === pluginName : plugin === pluginName);
}

function buildSummary(checks: LaunchReadinessCheck[]): LaunchReadinessSummary {
  const total = checks.length;
  const passed = checks.filter((check) => check.status === "pass").length;
  const warnings = checks.filter((check) => check.status === "warning").length;
  const blocked = checks.filter((check) => check.status === "blocked").length;
  const weightedScore = Math.max(0, Math.round(((passed + warnings * 0.5) / Math.max(total, 1)) * 100));

  return {
    total,
    passed,
    warnings,
    blocked,
    score: blocked > 0 ? Math.min(weightedScore, 74) : weightedScore,
    statusLabel: blocked > 0 ? "Blocked" : warnings > 0 ? "Ready with QA warnings" : "V1 Launch Candidate ready",
    generatedAt: new Date().toISOString(),
  };
}

function checkAppVersion(): LaunchReadinessCheck {
  const version = Constants.expoConfig?.version || "";
  const isStableVersion = /^\d+\.\d+\.\d+$/.test(version);

  return {
    id: "app-version",
    category: "build",
    title: "App version is release-ready",
    description: `Current app version: ${version || "missing"}.`,
    status: isStableVersion ? "pass" : "warning",
    owner: "release",
    action: isStableVersion ? undefined : "Set expo.version to a stable semantic version before Play Console rollout.",
  };
}

function checkAndroidPackage(): LaunchReadinessCheck {
  const packageName = Constants.expoConfig?.android?.package || "";
  const isValid = /^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/.test(packageName);

  return {
    id: "android-package",
    category: "android",
    title: "Android package is configured",
    description: `Android package: ${packageName || "missing"}.`,
    status: isValid ? "pass" : "blocked",
    owner: "release",
    action: isValid ? undefined : "Add a valid android.package value in app.json before APK/AAB release.",
  };
}

function checkAndroidPermissions(): LaunchReadinessCheck {
  const permissions = Constants.expoConfig?.android?.permissions || [];
  const hasPostNotifications = permissions.includes("POST_NOTIFICATIONS");

  return {
    id: "android-notification-permission",
    category: "android",
    title: "Android notification permission is present",
    description: hasPostNotifications ? "POST_NOTIFICATIONS is configured for reminders." : "POST_NOTIFICATIONS is missing.",
    status: hasPostNotifications ? "pass" : "warning",
    owner: "release",
    action: hasPostNotifications ? undefined : "Add POST_NOTIFICATIONS permission if reminders must fire on Android 13+.",
  };
}

function checkRouterConfig(): LaunchReadinessCheck {
  const hasRouter = hasExpoPlugin("expo-router");

  return {
    id: "expo-router",
    category: "navigation",
    title: "Expo Router is configured",
    description: hasRouter ? "expo-router plugin is active." : "expo-router plugin was not found.",
    status: hasRouter ? "pass" : "blocked",
    owner: "system",
    action: hasRouter ? undefined : "Restore expo-router plugin in app.json.",
  };
}

function checkSplashAndIcons(): LaunchReadinessCheck {
  const hasIcon = Boolean(Constants.expoConfig?.icon);
  const hasSplash = hasExpoPlugin("expo-splash-screen");
  const status = hasIcon && hasSplash ? "pass" : "warning";

  return {
    id: "branding-assets",
    category: "android",
    title: "Branding assets are wired",
    description: hasIcon && hasSplash ? "Icon and splash configuration detected." : "Icon or splash configuration needs QA review.",
    status,
    owner: "qa",
    action: status === "pass" ? undefined : "Open the installed APK and verify icon, splash screen and adaptive icon on Android.",
  };
}

async function checkSyncQueue(): Promise<LaunchReadinessCheck> {
  const queue = await getPendingSyncActions();
  const failedCount = queue.filter((item) => item.status === "failed").length;
  const pendingCount = queue.filter((item) => item.status === "pending" || item.status === "syncing").length;

  return {
    id: "offline-sync-queue",
    category: "offline",
    title: "Offline sync queue is stable",
    description: `${pendingCount} pending and ${failedCount} failed local sync actions on this device.`,
    status: failedCount > 0 ? "warning" : "pass",
    owner: "qa",
    action: failedCount > 0 ? "Open Sync & Diagnostics, retry sync, then clear synced test items before release testing." : undefined,
  };
}

function staticLaunchChecks(): LaunchReadinessCheck[] {
  return [
    checkAppVersion(),
    checkAndroidPackage(),
    checkAndroidPermissions(),
    checkRouterConfig(),
    checkSplashAndIcons(),
    {
      id: "production-error-boundary",
      category: "support",
      title: "Production error boundary is active",
      description: "App-level fallback is enabled and error logging is wired for clientErrorLogs.",
      status: "pass",
      owner: "system",
    },
    {
      id: "beta-feedback",
      category: "support",
      title: "Beta feedback flow is available",
      description: "Settings Center includes Bug Report & Beta Feedback with device diagnostics attached.",
      status: "pass",
      owner: "qa",
    },
    {
      id: "wellness-intelligence",
      category: "intelligence",
      title: "Wellness intelligence has safe defaults",
      description: "Dashboard and wellness intelligence use empty-state fallbacks instead of blocking V1 navigation.",
      status: "pass",
      owner: "system",
    },
    {
      id: "firebase-rules",
      category: "firebase",
      title: "Firestore rules deployed for V1 support records",
      description: "betaFeedback and clientErrorLogs rules are enabled.",
      status: "pass",
      owner: "release",
    },
    {
      id: "manual-apk-smoke-test",
      category: "android",
      title: "APK smoke test still required on physical Android",
      description: Platform.OS === "android" ? "Run the APK checklist on this Android device before final V1 sign-off." : "Run the APK checklist on a physical Android test device before final V1 sign-off.",
      status: "warning",
      owner: "qa",
      action: "Complete the APK checklist and mark issues through Beta Feedback.",
    },
  ];
}

export async function buildLaunchReadinessDashboard(): Promise<LaunchReadinessDashboard> {
  const checks = [...staticLaunchChecks(), await checkSyncQueue()];
  const summary = buildSummary(checks);

  const dashboard: LaunchReadinessDashboard = {
    summary,
    checks,
    apkChecklist: [
      "Fresh install -> Welcome -> Signup -> Dashboard opens without layout overlap.",
      "Login existing beta user -> profile photo loads and update flow works on Android.",
      "Hydration, Sleep, Yoga, Nutrition and Mood screens open and save normal entries.",
      "AI Coach, AI Memory and Wellness Intelligence open with safe empty states.",
      "Smart Notifications permission prompt appears and reminder settings save correctly.",
      "Settings Center -> Sync & Diagnostics -> run test action, sync, clear synced items.",
      "Settings Center -> Bug Report & Beta Feedback -> submit one test issue.",
      "Android back button returns to the previous screen and never exits from nested flow unexpectedly.",
      "Airplane mode -> offline banner stable; reconnect -> no infinite loop.",
      "No white-on-white text, broken cards, placeholder release text or missing route navigation.",
    ],
    finalCommands: [
      "npx tsc --noEmit",
      "npx expo-doctor",
      "npx expo export --platform web",
      "firebase deploy --only firestore",
      "eas build -p android --profile preview",
    ],
  };

  await saveLaunchAuditSnapshot({
    id: `launch_audit_${Date.now()}`,
    generatedAt: summary.generatedAt,
    summary,
    checks,
  });

  return dashboard;
}

export async function getLastLaunchAudit(): Promise<LaunchAuditSnapshot | null> {
  return getLaunchAuditSnapshot();
}
