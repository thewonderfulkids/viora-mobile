import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";
import { ReportExportRecord } from "../../types";

type ReportExportHistoryProps = {
  exports: ReportExportRecord[];
};

export function ReportExportHistory({ exports }: ReportExportHistoryProps) {
  if (!exports.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No report exports yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {exports.slice(0, 5).map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.reportTitle}</Text>
          <Text style={styles.meta}>{item.fileName} • {item.status}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: "900",
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  emptyText: {
    color: colors.mutedText,
    fontWeight: "800",
  },
});
