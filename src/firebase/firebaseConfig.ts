import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "firebase/app-check";
import { registerAppCheckTokenProvider } from "./appCheckToken";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBh46PgwgXiJHNxjo0hYtgRTJL6nIwnRKY",
  authDomain: "viora-9021a.firebaseapp.com",
  projectId: "viora-9021a",
  storageBucket: "viora-9021a.firebasestorage.app",
  messagingSenderId: "828098472036",
  appId: "1:828098472036:web:aa577e3dcc2bfa3f961771",
  measurementId: "G-5L4QXF8BDP",
};

export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Web attestation is opt-in; native platforms require their own attestation provider.
const webAppCheckSiteKey = process.env.EXPO_PUBLIC_APP_CHECK_SITE_KEY;
if (Platform.OS === "web" && typeof window !== "undefined" && webAppCheckSiteKey) {
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(webAppCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  registerAppCheckTokenProvider(async () => (await getToken(appCheck)).token);
}

function createAuth() {
  if (Platform.OS === "web") {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Handles Fast Refresh or an already initialized Firebase Auth instance.
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-south1");

export default app;
