import { CheckCircle2, TriangleAlert } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";
import { HealthReportDoc } from "../../types";

type ReportInsightListProps = {
  report: HealthReportDoc;
};

export function ReportInsightList({ report }: ReportInsightListProps) {
  return (
    <View style={styles.container}>
      {report.highlights.map((item) => (
        <View key={`highlight-${item}`} style={styles.row}>
          <CheckCircle2 size={18} color={colors.primary} />
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
      {report.risks.map((item) => (
        <View key={`risk-${item}`} style={styles.row}>
          <TriangleAlert size={18} color={colors.warning} />
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
  },
});
