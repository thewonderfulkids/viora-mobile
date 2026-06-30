import { Pressable, StyleSheet, Text, View } from "react-native";

import { MoodEntryDoc } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

type MoodEntryListProps = {
  entries: MoodEntryDoc[];
  saving: boolean;
  onDelete: (entryId: string) => Promise<void> | void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function MoodEntryList({ entries, saving, onDelete }: MoodEntryListProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No mood check-ins yet</Text>
        <Text style={styles.emptyText}>Save your first check-in above to activate emotional pattern learning.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {entries.slice(0, 8).map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.title}>{entry.moodLevel}/5 mood • {entry.stressLevel}/10 stress</Text>
              <Text style={styles.time}>{formatDate(entry.createdAt)}</Text>
            </View>
            <Pressable disabled={saving} onPress={() => onDelete(entry.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Remove</Text>
            </Pressable>
          </View>
          <Text style={styles.reflection}>{entry.aiReflection}</Text>
          {entry.note ? <Text style={styles.note}>“{entry.note}”</Text> : null}
          <View style={styles.chips}>
            {entry.emotions.slice(0, 4).map((emotion) => (
              <Text key={emotion} style={styles.chip}>{emotion.replace(/_/g, " ")}</Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  emptyCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.mutedText,
    ...typography.caption,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  time: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  deleteButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "900",
  },
  reflection: {
    color: colors.mutedText,
    ...typography.caption,
  },
  note: {
    color: colors.text,
    fontStyle: "italic",
    ...typography.caption,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    color: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
});
