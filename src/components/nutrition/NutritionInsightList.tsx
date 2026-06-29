import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { NutritionInsight } from "../../types";

type NutritionInsightListProps = {
  insights: NutritionInsight[];
};

function toneColor(tone: NutritionInsight["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.teal;
}

export function NutritionInsightList({ insights }: NutritionInsightListProps) {
  return (
    <View style={styles.list}>
      {insights.map((insight) => (
        <View key={insight.id} style={styles.card}>
          <View style={[styles.bar, { backgroundColor: toneColor(insight.tone) }]} />
          <View style={styles.copy}>
            <Text style={styles.title}>{insight.title}</Text>
            <Text style={styles.message}>{insight.message}</Text>
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
  card: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  bar: {
    width: 5,
    borderRadius: radius.pill,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  message: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
