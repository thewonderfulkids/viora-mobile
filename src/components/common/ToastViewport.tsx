import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { ToastItem, ToastType } from "../../types/toast";

type ToastViewportProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

function getToastColor(type: ToastType) {
  switch (type) {
    case "success":
      return "#059669";
    case "error":
      return colors.danger;
    case "warning":
      return "#D97706";
    case "info":
    default:
      return colors.primary;
  }
}

function ToastIcon({ type }: { type: ToastType }) {
  const iconColor = colors.white;

  if (type === "success") return <CheckCircle2 size={20} color={iconColor} />;
  if (type === "error") return <XCircle size={20} color={iconColor} />;
  if (type === "warning") return <AlertTriangle size={20} color={iconColor} />;

  return <Info size={20} color={iconColor} />;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {toasts.map((toast) => {
        const backgroundColor = getToastColor(toast.type);

        return (
          <View
            key={toast.id}
            style={[styles.toast, { backgroundColor }]}
            accessibilityRole="alert"
          >
            <View style={styles.iconWrap}>
              <ToastIcon type={toast.type} />
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{toast.title}</Text>

              {toast.message ? (
                <Text style={styles.message}>{toast.message}</Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => onDismiss(toast.id)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
            >
              <X size={18} color={colors.white} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 54,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toast: {
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  message: {
    marginTop: 2,
    color: colors.white,
    opacity: 0.92,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});