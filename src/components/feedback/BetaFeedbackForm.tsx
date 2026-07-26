import { Bug, CheckCircle2, MonitorSmartphone, Send } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BetaFeedbackCategory, BetaFeedbackSeverity } from "../../types";
import { colors, radius, spacing } from "../../theme";

const categories: { label: string; value: BetaFeedbackCategory }[] = [
  { label: "Bug", value: "bug" },
  { label: "UI", value: "ui" },
  { label: "Sync", value: "sync" },
  { label: "Notifications", value: "notifications" },
  { label: "AI Intelligence", value: "wellness_intelligence" },
  { label: "Other", value: "other" },
];

const severities: { label: string; value: BetaFeedbackSeverity }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

type BetaFeedbackFormProps = {
  title: string;
  details: string;
  currentScreen: string;
  category: BetaFeedbackCategory;
  severity: BetaFeedbackSeverity;
  submitting: boolean;
  canSubmit: boolean;
  error: string | null;
  successMessage: string | null;
  onTitleChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  onCurrentScreenChange: (value: string) => void;
  onCategoryChange: (value: BetaFeedbackCategory) => void;
  onSeverityChange: (value: BetaFeedbackSeverity) => void;
  onSubmit: () => void;
};

export function BetaFeedbackForm({
  title,
  details,
  currentScreen,
  category,
  severity,
  submitting,
  canSubmit,
  error,
  successMessage,
  onTitleChange,
  onDetailsChange,
  onCurrentScreenChange,
  onCategoryChange,
  onSeverityChange,
  onSubmit,
}: BetaFeedbackFormProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Bug size={22} color={colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Beta Feedback</Text>
          <Text style={styles.subtitle}>Device and build diagnostics are attached automatically.</Text>
        </View>
      </View>

      {successMessage ? (
        <View style={styles.successBox}>
          <CheckCircle2 size={18} color={colors.primaryDark} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Issue title</Text>
        <TextInput
          value={title}
          onChangeText={onTitleChange}
          placeholder="Example: Reminder did not fire on Android"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          maxLength={120}
          returnKeyType="next"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipGrid}>
          {categories.map((item) => (
            <Pressable key={item.value} onPress={() => onCategoryChange(item.value)} style={[styles.chip, category === item.value && styles.activeChip]}>
              <Text style={[styles.chipText, category === item.value && styles.activeChipText]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Severity</Text>
        <View style={styles.chipGrid}>
          {severities.map((item) => (
            <Pressable key={item.value} onPress={() => onSeverityChange(item.value)} style={[styles.chip, severity === item.value && styles.activeChip]}>
              <Text style={[styles.chipText, severity === item.value && styles.activeChipText]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Screen or flow</Text>
        <TextInput
          value={currentScreen}
          onChangeText={onCurrentScreenChange}
          placeholder="Example: Settings → Smart Notifications"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          maxLength={140}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>What happened?</Text>
        <TextInput
          value={details}
          onChangeText={onDetailsChange}
          placeholder="Write exact steps, expected behavior and actual behavior."
          placeholderTextColor={colors.mutedText}
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
          maxLength={4000}
        />
      </View>

      <View style={styles.diagnosticsNote}>
        <MonitorSmartphone size={17} color={colors.primaryDark} />
        <Text style={styles.diagnosticsText}>App version, build number, platform, device, OS and timestamp will be saved with this report.</Text>
      </View>

      <Pressable disabled={!canSubmit} onPress={onSubmit} style={({ pressed }) => [styles.submitButton, (!canSubmit || submitting) && styles.disabled, pressed && styles.pressed]}>
        <Send size={17} color={colors.white} />
        <Text style={styles.submitText}>{submitting ? "Submitting..." : "Submit Feedback"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 20, fontWeight: "900" },
  subtitle: { marginTop: 4, color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  fieldGroup: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 13, fontWeight: "900" },
  input: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  textArea: { minHeight: 140, lineHeight: 20 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.mutedText, fontSize: 12, fontWeight: "900" },
  activeChipText: { color: colors.white },
  diagnosticsNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.softGreen,
    padding: spacing.md,
  },
  diagnosticsText: { flex: 1, color: colors.primaryDark, fontSize: 12, lineHeight: 18, fontWeight: "800" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
  },
  submitText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  errorBox: { borderRadius: radius.lg, backgroundColor: "#FFF4F4", borderWidth: 1, borderColor: colors.danger, padding: spacing.md },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  successBox: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.softGreen, padding: spacing.md },
  successText: { flex: 1, color: colors.primaryDark, fontSize: 13, lineHeight: 18, fontWeight: "800" },
});
