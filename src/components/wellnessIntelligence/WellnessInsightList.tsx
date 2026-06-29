import { StyleSheet, Text, View } from "react-native";
import { WellnessInsight } from "../../types/wellnessIntelligence";
import { colors, radius, spacing } from "../../theme";

type WellnessInsightListProps = { insights: WellnessInsight[]; emptyText?: string };

export function WellnessInsightList({ insights, emptyText = "No insights available yet." }: WellnessInsightListProps) {
  if (!insights.length) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }

  return (
    <View style={styles.list}>
      {insights.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.category}>{item.category.replace("_", " ")}</Text>
            <Text style={styles.confidence}>{Math.round(item.confidence * 100)}%</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.severity}>{item.severity}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  topRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  category: { color: colors.primary, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  confidence: { color: colors.mutedText, fontSize: 11, fontWeight: "900" },
  title: { color: colors.text, fontSize: 15, fontWeight: "900" },
  message: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  severity: { alignSelf: "flex-start", color: colors.primaryDark, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  empty: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
});
