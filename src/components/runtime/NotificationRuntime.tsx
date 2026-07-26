import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { initializeNativeNotificationRuntime } from "../../services/notifications/nativeNotificationService";

const ALLOWED_NOTIFICATION_ROUTES = new Set([
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
    if (Platform.OS === "web" || !user) return;

    void initializeNativeNotificationRuntime();

    const openResponse = (response: Notifications.NotificationResponse) => {
      const responseId = response.notification.request.identifier;
      if (handledResponseId.current === responseId) return;
      handledResponseId.current = responseId;

      const actionRoute = readActionRoute(response);
      if (actionRoute) router.push(actionRoute as never);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(openResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openResponse(response);
    });

    return () => subscription.remove();
  }, [user]);

  return null;
}
