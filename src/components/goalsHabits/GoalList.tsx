import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "../common";
import { colors, radius, spacing, typography } from "../../theme";
import { GoalDoc, GoalPrediction } from "../../types/goalsHabits";

type GoalListProps = {
  goals: GoalDoc[];
  predictions: GoalPrediction[];
  saving: boolean;
  onIncreaseProgress: (goal: GoalDoc) => void;
  onArchive: (goalId: string) => void;
};

function getPercent(goal: GoalDoc) {
  if (goal.targetValue <= 0) return 0;
  return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
}

function formatProgress(goal: GoalDoc) {
  return `${goal.currentValue}/${goal.targetValue} ${goal.unit}`;
}

export function GoalList({ goals, predictions, saving, onIncreaseProgress, onArchive }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <AppCard>
        <Text style={styles.emptyTitle}>No active goals yet</Text>
        <Text style={styles.emptyText}>Use AI suggestions below to create your first measurable wellness goal.</Text>
      </AppCard>
    );
  }

  return (
    <View style={styles.list}>
      {goals.map((goal) => {
        const percent = getPercent(goal);
        const prediction = predictions.find((item) => item.goalId === goal.id);

        return (
          <AppCard key={goal.id}>
            <View style={styles.header}>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>{goal.title}</Text>
                <Text style={styles.description}>{goal.description}</Text>
              </View>
              <Text style={styles.percent}>{percent}%</Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${percent}%` }]} />
            </View>

            <Text style={styles.meta}>{formatProgress(goal)} • Target {goal.targetDate}</Text>
            {prediction ? <Text style={styles.prediction}>{prediction.message}</Text> : null}

            <View style={styles.actions}>
              <Pressable disabled={saving} onPress={() => onIncreaseProgress(goal)} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Add Progress</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={() => onArchive(goal.id)} style={styles.secondaryAction}>
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
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  description: {
    marginTop: 4,
    color: colors.mutedText,
    ...typography.caption,
  },
  percent: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  track: {
    marginTop: spacing.md,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.softGreen,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  prediction: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
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
