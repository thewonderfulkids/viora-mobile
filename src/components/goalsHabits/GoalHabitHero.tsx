import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "../common";
import { colors, spacing, typography } from "../../theme";
import { GoalHabitDashboard } from "../../types/goalsHabits";

type GoalHabitHeroProps = {
  dashboard: GoalHabitDashboard;
};

export function GoalHabitHero({ dashboard }: GoalHabitHeroProps) {
  return (
    <AppCard>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🎯</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>Goals & Habit Intelligence</Text>
          <Text style={styles.title}>{dashboard.consistencyScore}% consistency</Text>
          <Text style={styles.subtitle}>{dashboard.weeklySummary}</Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  label: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});
