import { StyleSheet, Text, View } from "react-native";

import { MentalInsight } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

type MentalInsightListProps = {
  insights: MentalInsight[];
};

function toneStyles(tone: MentalInsight["tone"]) {
  if (tone === "positive") return { borderColor: colors.primary, backgroundColor: colors.softGreen };
  if (tone === "warning") return { borderColor: colors.warning, backgroundColor: "#FFF7ED" };
  return { borderColor: colors.border, backgroundColor: colors.white };
}

export function MentalInsightList({ insights }: MentalInsightListProps) {
  return (
    <View style={styles.list}>
      {insights.map((insight) => (
        <View key={insight.id} style={[styles.card, toneStyles(insight.tone)]}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.message}>{insight.message}</Text>
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
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  message: {
    color: colors.mutedText,
    ...typography.caption,
  },
});
