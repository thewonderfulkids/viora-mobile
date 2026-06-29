import { StyleSheet, Text, View } from "react-native";
import { WellnessRecommendation } from "../../types/wellnessIntelligence";
import { colors, radius, spacing } from "../../theme";

type WellnessRecommendationListProps = { recommendations: WellnessRecommendation[] };

export function WellnessRecommendationList({ recommendations }: WellnessRecommendationListProps) {
  return (
    <View style={styles.list}>
      {recommendations.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.priority}>#{item.priority}</Text>
            <Text style={styles.focus}>{item.focusArea.replace("_", " ")}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.action}>{item.action}</Text>
          <Text style={styles.reason}>{item.reason}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priority: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  focus: { color: colors.mutedText, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 16, fontWeight: "900" },
  action: { color: colors.primaryDark, fontSize: 13, lineHeight: 19, fontWeight: "800" },
  reason: { color: colors.mutedText, fontSize: 12, lineHeight: 18, fontWeight: "600" },
});
