import { Platform } from "react-native";

// Bridge for a trusted platform attestation provider. No debug or fabricated tokens.
type TokenProvider = () => Promise<string | null>;
let provider: TokenProvider | undefined;
let nativeInitialization: Promise<Awaited<ReturnType<typeof initializeNativeAppCheck>>> | undefined;

async function initializeNativeAppCheck() {
  const sdk = await import("@react-native-firebase/app-check");
  const nativeProvider = new sdk.ReactNativeFirebaseAppCheckProvider();
  nativeProvider.configure({ android: { provider: "playIntegrity" } });
  return sdk.initializeAppCheck(undefined, { provider: nativeProvider, isTokenAutoRefreshEnabled: true });
}

async function getAndroidToken(): Promise<string | null> {
  if (!nativeInitialization) {
    nativeInitialization = initializeNativeAppCheck().catch(error => {
      nativeInitialization = undefined;
      throw error;
    });
  }
  const instance = await nativeInitialization;
  const sdk = await import("@react-native-firebase/app-check");
  return (await sdk.getToken(instance, false)).token;
}

export function registerAppCheckTokenProvider(next: TokenProvider): void {
  provider = next;
}
export async function getVioraAppCheckToken(): Promise<string | null> {
  const activeProvider = provider ?? (
    Platform.OS === "android" && process.env.EXPO_PUBLIC_APP_CHECK_ANDROID_ENABLED === "true"
      ? getAndroidToken : undefined
  );
  if (!activeProvider) return null;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let token: string | null;
  try {
    token = await Promise.race([
      activeProvider(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("App verification unavailable")), 8000);
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
  if (typeof token !== "string" || !token.trim() || token.length > 8192) throw new Error("App verification unavailable");
  return token;
}
