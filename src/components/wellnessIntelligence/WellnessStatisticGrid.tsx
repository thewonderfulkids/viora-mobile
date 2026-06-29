import { StyleSheet, Text, View } from "react-native";
import { WellnessLearningStatistic } from "../../types";
import { colors, radius, spacing } from "../../theme";

type WellnessStatisticGridProps = { statistics: WellnessLearningStatistic[] };

export function WellnessStatisticGrid({ statistics }: WellnessStatisticGridProps) {
  return (
    <View style={styles.grid}>
      {statistics.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.helper}>{item.helper}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  card: { width: "48%", backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, minHeight: 112 },
  value: { color: colors.text, fontSize: 22, fontWeight: "900" },
  label: { marginTop: 4, color: colors.primaryDark, fontSize: 12, fontWeight: "900" },
  helper: { marginTop: 4, color: colors.mutedText, fontSize: 11, lineHeight: 16, fontWeight: "600" },
});
