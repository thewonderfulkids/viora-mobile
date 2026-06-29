import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "../common";
import { colors, spacing, typography } from "../../theme";
import { GoalInsight } from "../../types/goalsHabits";

type GoalHabitInsightsProps = {
  insights: GoalInsight[];
};

function toneIcon(tone: GoalInsight["tone"]) {
  if (tone === "positive") return "🌱";
  if (tone === "warning") return "⚠️";
  return "✨";
}

export function GoalHabitInsights({ insights }: GoalHabitInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <View style={styles.list}>
      {insights.map((item) => (
        <AppCard key={item.id}>
          <View style={styles.row}>
            <Text style={styles.icon}>{toneIcon(item.tone)}</Text>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  message: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});
