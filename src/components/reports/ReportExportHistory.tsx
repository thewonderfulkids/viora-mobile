import { Download } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";
import { ReportExportRecord } from "../../types";

type ReportExportHistoryProps = {
  exports: ReportExportRecord[];
  onOpenExport?: (exportId: string) => void;
};

export function ReportExportHistory({ exports, onOpenExport }: ReportExportHistoryProps) {
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
          <View style={styles.cardHeader}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>{item.reportTitle}</Text>
              <Text style={styles.meta}>{item.fileName} • {item.status}</Text>
            </View>
            <Pressable disabled={!onOpenExport} style={styles.openButton} onPress={() => onOpenExport?.(item.id)}>
              <Download size={15} color={colors.primaryDark} />
              <Text style={styles.openText}>Open</Text>
            </Pressable>
          </View>
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copyBlock: {
    flex: 1,
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
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  openText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
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
