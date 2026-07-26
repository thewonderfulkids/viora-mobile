import { Download, Save } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";

type ReportExportCardProps = {
  canExport: boolean;
  saving: boolean;
  onSave: () => void;
  onExport: () => void;
};

export function ReportExportCard({ canExport, saving, onSave, onExport }: ReportExportCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>Export & Save</Text>
        <Text style={styles.subtitle}>Save this report or export it as a shareable PDF for doctor visits and personal records.</Text>
      </View>
      <View style={styles.actions}>
        <Pressable disabled={saving} style={styles.secondaryButton} onPress={onSave}>
          {saving ? <ActivityIndicator size="small" color={colors.primaryDark} /> : <Save size={16} color={colors.primaryDark} />}
          <Text style={styles.secondaryText}>{saving ? "Working..." : "Save Report"}</Text>
        </Pressable>
        <Pressable disabled={!canExport || saving} style={[styles.primaryButton, (!canExport || saving) && styles.disabledButton]} onPress={onExport}>
          {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Download size={16} color={colors.white} />}
          <Text style={styles.primaryText}>{canExport ? "Download PDF" : "Upgrade to Export"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "900",
  },
  secondaryText: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
});
