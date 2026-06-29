import { StyleSheet, Text, View } from "react-native";
import { WellnessMetricSnapshot } from "../../types";
import { colors, radius, spacing } from "../../theme";

type WellnessMetricGridProps = { metrics: WellnessMetricSnapshot[] };

function statusLabel(status: WellnessMetricSnapshot["status"]) {
  if (status === "needs_attention") return "Needs attention";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function WellnessMetricGrid({ metrics }: WellnessMetricGridProps) {
  return (
    <View style={styles.grid}>
      {metrics.map((item) => (
        <View key={item.key} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.trend}>{item.trend}</Text>
          </View>
          <Text style={styles.value}>{item.value}<Text style={styles.unit}>/{item.goal} {item.unit}</Text></Text>
          <Text style={styles.status}>{statusLabel(item.status)}</Text>
          <Text style={styles.helper}>{item.helperText}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  label: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "900" },
  trend: { color: colors.primary, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 24, fontWeight: "900" },
  unit: { color: colors.mutedText, fontSize: 12, fontWeight: "800" },
  status: { color: colors.primaryDark, fontSize: 12, fontWeight: "900" },
  helper: { color: colors.mutedText, fontSize: 12, lineHeight: 18, fontWeight: "600" },
});
