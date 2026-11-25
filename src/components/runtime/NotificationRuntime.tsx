import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { initializeNativeNotificationRuntime } from "../../services/notifications/nativeNotificationService";

import { reconcilePremiumNotificationSession } from "../../services/notifications2/premiumNotificationService";

const ALLOWED_NOTIFICATION_ROUTES = new Set([
  "/(tabs)",
  "/steps",
  "/mental-wellness",
  "/hydration",
  "/sleep",
  "/yoga",
  "/meditation",
  "/nutrition",
  "/home-workout",
  "/goals-habits",
  "/ai-memory",
  "/ai-coach",
  "/reports",
  "/smart-notifications",
  "/notification-preferences",
]);

function readActionRoute(response: Notifications.NotificationResponse) {
  const value = response.notification.request.content.data?.actionRoute;
  if (typeof value !== "string") return null;
  return ALLOWED_NOTIFICATION_ROUTES.has(value) ? value : null;
}

export function NotificationRuntime() {
  const { user } = useAuth();
  const handledResponseId = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android" && Platform.OS !== "ios") return;
    const reconcile = () => { void reconcilePremiumNotificationSession().catch(() => undefined); };
    let authReady = false;
    const unsubscribe = onAuthStateChanged(auth, () => { authReady = true; reconcile(); });
    const state = AppState.addEventListener("change", (next) => { if (authReady && next === "active") reconcile(); });
    return () => { unsubscribe(); state.remove(); };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" || !user) return;

    let active = true;
    const uid = user.uid;
    void initializeNativeNotificationRuntime().catch(() => undefined);

    const openResponse = (response: Notifications.NotificationResponse) => {
      if (!active || auth.currentUser !== user) return;
      const data = response.notification.request.content.data;
      // Unscoped legacy schedules have no trusted tap owner.
      if (data?.userId !== uid) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseId.current === responseId) return;
      handledResponseId.current = responseId;

      const actionRoute = readActionRoute(response);
      if (actionRoute) router.push(actionRoute as never);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(openResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openResponse(response);
    }).catch(() => undefined);

    return () => { active = false; subscription.remove(); };
  }, [user]);

  return null;
}
