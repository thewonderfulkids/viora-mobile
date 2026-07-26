import { ShieldCheck, UserRoundSearch } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PremiumPlanCode } from "../../types";
import { PREMIUM_PLANS } from "../../services/premium";
import { PrimaryButton } from "../common";

type AdminAccessPanelProps = {
  email: string;
  selectedPlanCode: PremiumPlanCode;
  note: string;
  loading: boolean;
  saving: boolean;
  message: string | null;
  error: string | null;
  targetUser: {
    uid: string;
    fullName: string;
    email: string;
    mobile?: string;
  } | null;
  onEmailChange: (value: string) => void;
  onPlanChange: (value: PremiumPlanCode) => void;
  onNoteChange: (value: string) => void;
  onSearch: () => void;
  onGrant: () => void;
};

export function AdminAccessPanel({
  email,
  selectedPlanCode,
  note,
  loading,
  saving,
  message,
  error,
  targetUser,
  onEmailChange,
  onPlanChange,
  onNoteChange,
  onSearch,
  onGrant,
}: AdminAccessPanelProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={22} color={colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Admin Access Grant</Text>
          <Text style={styles.subtitle}>Search a registered user and assign Viora premium access for beta/support cases.</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>User email</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={email}
            onChangeText={onEmailChange}
            placeholder="customer@email.com"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Pressable onPress={onSearch} disabled={loading} style={({ pressed }) => [styles.searchButton, pressed ? styles.pressed : null, loading ? styles.disabled : null]}>
            <UserRoundSearch size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>

      {targetUser ? (
        <View style={styles.userBox}>
          <Text style={styles.userName}>{targetUser.fullName}</Text>
          <Text style={styles.userMeta}>{targetUser.email}</Text>
          {targetUser.mobile ? <Text style={styles.userMeta}>Mobile: {targetUser.mobile}</Text> : null}
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Access plan</Text>
        <View style={styles.planGrid}>
          {PREMIUM_PLANS.map((plan) => (
            <Pressable
              key={plan.code}
              onPress={() => onPlanChange(plan.code)}
              style={({ pressed }) => [
                styles.planChip,
                selectedPlanCode === plan.code ? styles.planChipSelected : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.planChipText, selectedPlanCode === plan.code ? styles.planChipTextSelected : null]}>{plan.displayName}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Internal note</Text>
        <TextInput
          value={note}
          onChangeText={onNoteChange}
          placeholder="Why this access is being granted"
          placeholderTextColor={colors.mutedText}
          multiline
          style={[styles.input, styles.noteInput]}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {message ? <Text style={styles.successText}>{message}</Text> : null}

      <PrimaryButton
        title={saving ? "Granting access..." : "Grant / Update Access"}
        onPress={onGrant}
        disabled={!targetUser || saving}
      />
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
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  headerCopy: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  fieldGroup: { gap: spacing.sm },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  noteInput: {
    minHeight: 84,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  searchButton: {
    width: 50,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
  userBox: {
    borderRadius: radius.xl,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  userMeta: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  planGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  planChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  planChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  planChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  planChipTextSelected: { color: colors.white },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },
  successText: {
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
});
