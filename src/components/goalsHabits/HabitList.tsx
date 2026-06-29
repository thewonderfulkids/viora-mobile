import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "../common";
import { colors, radius, spacing, typography } from "../../theme";
import { HabitDoc } from "../../types";

type HabitListProps = {
  habits: HabitDoc[];
  completedHabitIds: Set<string>;
  saving: boolean;
  onComplete: (habit: HabitDoc) => void;
  onArchive: (habitId: string) => void;
};

export function HabitList({ habits, completedHabitIds, saving, onComplete, onArchive }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <AppCard>
        <Text style={styles.emptyTitle}>No active habits yet</Text>
        <Text style={styles.emptyText}>Add one habit suggestion to start building your wellness streak.</Text>
      </AppCard>
    );
  }

  return (
    <View style={styles.list}>
      {habits.map((habit) => {
        const isCompleted = completedHabitIds.has(habit.id);

        return (
          <AppCard key={habit.id}>
            <View style={styles.header}>
              <View style={styles.statusWrap}>
                <Text style={styles.icon}>{isCompleted ? "✅" : "🔥"}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{habit.title}</Text>
                <Text style={styles.description}>{habit.description}</Text>
                <Text style={styles.meta}>
                  {habit.frequency} • streak {habit.streak} • best {habit.bestStreak}
                  {habit.reminderTime ? ` • ${habit.reminderTime}` : ""}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={saving}
                onPress={() => onComplete(habit)}
                style={[styles.primaryAction, isCompleted && styles.completedAction]}
              >
                <Text style={styles.primaryActionText}>{isCompleted ? "Done Today" : "Complete Today"}</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={() => onArchive(habit.id)} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Archive</Text>
              </Pressable>
            </View>
          </AppCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statusWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  description: {
    marginTop: 4,
    color: colors.mutedText,
    ...typography.caption,
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  actions: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryAction: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  completedAction: {
    backgroundColor: colors.primaryDark,
  },
  primaryActionText: {
    color: colors.white,
    fontWeight: "900",
  },
  secondaryAction: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryActionText: {
    color: colors.mutedText,
    fontWeight: "900",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});
