import { Platform } from "react-native";

// Bridge for a trusted platform attestation provider. No debug or fabricated tokens.
type TokenProvider = () => Promise<string | null>;
let provider: TokenProvider | undefined;
let nativeInitialization: Promise<import("@react-native-firebase/app-check").FirebaseAppCheckTypes.Module> | undefined;

async function getAndroidToken(): Promise<string | null> {
  // Load only on Android and only when the rollout is explicitly enabled.
  const sdk = await import("@react-native-firebase/app-check");
  if (!nativeInitialization) {
    nativeInitialization = (async () => {
      const instance = sdk.default();
      const nativeProvider = instance.newReactNativeFirebaseAppCheckProvider();
      nativeProvider.configure({ android: { provider: "playIntegrity" } });
      await instance.initializeAppCheck({ provider: nativeProvider, isTokenAutoRefreshEnabled: true });
      return instance;
    })().catch(error => {
      nativeInitialization = undefined;
      throw error;
    });
  }
  const instance = await nativeInitialization;
  return (await instance.getToken(false)).token;
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
