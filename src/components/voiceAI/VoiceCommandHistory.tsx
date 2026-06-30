import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { VoiceCommandRecord } from "../../types";

type Props = {
  history: VoiceCommandRecord[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function VoiceCommandHistory({ history }: Props) {
  if (history.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No voice history yet</Text>
        <Text style={styles.emptyText}>Your latest commands will be saved here for audit, AI memory and future analytics.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {history.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.transcript}>“{item.transcript}”</Text>
          <Text style={styles.meta}>{item.intent.type.replace(/_/g, " ")} · {item.status.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  date: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  transcript: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
  },
  meta: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
