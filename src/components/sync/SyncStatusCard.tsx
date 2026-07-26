import { CheckCircle2, CloudOff, RefreshCw, Wifi } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SyncDashboard } from "../../types";
import { colors, radius, spacing } from "../../theme";

type SyncStatusCardProps = {
  dashboard: SyncDashboard;
  onSync: () => void;
};

function formatDate(value: string | null) {
  if (!value) return "Not synced yet";
  return new Date(value).toLocaleString();
}

export function SyncStatusCard({ dashboard, onSync }: SyncStatusCardProps) {
  const Icon = dashboard.isOnline ? Wifi : CloudOff;
  const statusColor = dashboard.isOnline ? colors.primary : colors.danger;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconShell, { backgroundColor: dashboard.isOnline ? colors.softGreen : "#FEE2E2" }]}>
          <Icon size={22} color={statusColor} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{dashboard.isOnline ? "Online & ready to sync" : "Offline mode active"}</Text>
          <Text style={styles.subtitle}>Last sync: {formatDate(dashboard.summary.lastSyncedAt)}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{dashboard.summary.pendingCount}</Text>
          <Text style={styles.metricLabel}>Pending</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{dashboard.summary.syncedCount}</Text>
          <Text style={styles.metricLabel}>Synced</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{dashboard.summary.failedCount}</Text>
          <Text style={styles.metricLabel}>Failed</Text>
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onSync} disabled={dashboard.isSyncing}>
        {dashboard.isSyncing ? <RefreshCw size={16} color={colors.white} /> : <CheckCircle2 size={16} color={colors.white} />}
        <Text style={styles.buttonText}>{dashboard.isSyncing ? "Syncing..." : "Run Sync Check"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metric: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.softGreen,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: "900",
  },
  metricLabel: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.78,
  },
});
