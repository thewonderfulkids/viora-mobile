import { CheckCircle2, CircleAlert, CircleX, ClipboardCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { LaunchCheckStatus, LaunchReadinessCheck, LaunchReadinessDashboard } from "../../types";
import { colors, radius, spacing } from "../../theme";

function getStatusCopy(status: LaunchCheckStatus) {
  if (status === "pass") return { label: "PASS", icon: CheckCircle2, color: colors.primary };
  if (status === "warning") return { label: "QA", icon: CircleAlert, color: colors.warning };
  return { label: "BLOCKED", icon: CircleX, color: colors.danger };
}

function LaunchCheckRow({ check }: { check: LaunchReadinessCheck }) {
  const status = getStatusCopy(check.status);
  const Icon = status.icon;

  return (
    <View style={styles.checkRow}>
      <View style={styles.checkHeader}>
        <View style={styles.checkTitleWrap}>
          <Icon size={18} color={status.color} />
          <Text style={styles.checkTitle}>{check.title}</Text>
        </View>
        <Text style={[styles.statusPill, { color: status.color }]}>{status.label}</Text>
      </View>
      <Text style={styles.checkDescription}>{check.description}</Text>
      {check.action ? <Text style={styles.actionText}>Action: {check.action}</Text> : null}
    </View>
  );
}

export function LaunchReadinessPanel({ dashboard }: { dashboard: LaunchReadinessDashboard }) {
  const { summary } = dashboard;

  return (
    <View style={styles.wrapper}>
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <ClipboardCheck size={26} color={colors.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>V1 Launch Candidate</Text>
          <Text style={styles.heroTitle}>{summary.statusLabel}</Text>
          <Text style={styles.heroSubtitle}>Readiness score {summary.score}% · {summary.passed}/{summary.total} checks passing</Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.passed}</Text>
          <Text style={styles.metricLabel}>Passed</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.warnings}</Text>
          <Text style={styles.metricLabel}>QA Items</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.blocked}</Text>
          <Text style={styles.metricLabel}>Blocked</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Release checks</Text>
        {dashboard.checks.map((check) => <LaunchCheckRow key={check.id} check={check} />)}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>APK checklist</Text>
        {dashboard.apkChecklist.map((item, index) => (
          <Text key={item} style={styles.listItem}>{index + 1}. {item}</Text>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Final commands</Text>
        {dashboard.finalCommands.map((command) => <Text key={command} style={styles.commandText}>{command}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  heroCard: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  heroTitle: {
    marginTop: 5,
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  heroSubtitle: {
    marginTop: 6,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  metricGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  metricLabel: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  checkRow: {
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  checkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  statusPill: {
    fontSize: 10,
    fontWeight: "900",
  },
  checkDescription: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  actionText: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  listItem: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  commandText: {
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
});
