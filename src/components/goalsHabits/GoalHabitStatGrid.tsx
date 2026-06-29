import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "../common";
import { colors, spacing, typography } from "../../theme";
import { GoalHabitStat } from "../../types/goalsHabits";

type GoalHabitStatGridProps = {
  stats: GoalHabitStat[];
};

export function GoalHabitStatGrid({ stats }: GoalHabitStatGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((item) => (
        <View key={item.label} style={styles.item}>
          <AppCard>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.helper}>{item.helper}</Text>
          </AppCard>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  item: {
    width: "47%",
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  label: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});
