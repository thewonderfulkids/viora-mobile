import { WifiOff } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useNetwork } from "../../hooks/useNetwork";
import { colors, radius, spacing } from "../../theme";

export function OfflineBanner() {
  const { isOnline, isChecking, refreshNetworkStatus } = useNetwork();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <WifiOff size={18} color={colors.white} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>You are offline</Text>
          <Text style={styles.message}>
            Some AI and cloud features may not work until internet is back.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={refreshNetworkStatus}
        disabled={isChecking}
        style={[styles.retryButton, isChecking && styles.disabled]}
      >
        <Text style={styles.retryText}>{isChecking ? "Checking" : "Retry"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
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
    fontWeight: "600",
    lineHeight: 17,
  },
  retryButton: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.65,
  },
  retryText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "900",
  },
});