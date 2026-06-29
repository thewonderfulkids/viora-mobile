import { StyleSheet, Text, View } from "react-native";
import { WellnessRiskSignal } from "../../types/wellnessIntelligence";
import { colors, radius, spacing } from "../../theme";

type WellnessRiskListProps = { risks: WellnessRiskSignal[] };

export function WellnessRiskList({ risks }: WellnessRiskListProps) {
  if (!risks.length) {
    return <Text style={styles.empty}>No risk signals detected today.</Text>;
  }

  return (
    <View style={styles.list}>
      {risks.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.severity}>{item.severity}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  severity: { color: colors.primary, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 15, fontWeight: "900" },
  message: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  empty: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
});
