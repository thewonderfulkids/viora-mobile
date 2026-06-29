import { CheckCircle2, Clock3, XCircle } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { WellnessReminder, WellnessReminderStatus } from "../../types/notifications";

type Props = {
  reminders: WellnessReminder[];
  saving: boolean;
  emptyText: string;
  onStatusChange: (reminderId: string, status: WellnessReminderStatus) => void;
};

function formatSchedule(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Scheduled soon";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReminderList({ reminders, saving, emptyText, onStatusChange }: Props) {
  if (reminders.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {reminders.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.clockBox}>
              <Clock3 size={17} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {formatSchedule(item.scheduledFor)} • {item.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.source}>{item.source.replace("_", " ")} • {item.cadence}</Text>

          {item.status === "scheduled" ? (
            <View style={styles.actions}>
              <TouchableOpacity
                disabled={saving}
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => onStatusChange(item.id, "completed")}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={16} color={colors.white} />
                <Text style={styles.completeText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={saving}
                style={[styles.actionButton, styles.dismissButton]}
                onPress={() => onStatusChange(item.id, "dismissed")}
                activeOpacity={0.85}
              >
                <XCircle size={16} color={colors.mutedText} />
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  emptyBox: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  clockBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  meta: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  message: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  source: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  dismissButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  dismissText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "900",
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
  },
});
