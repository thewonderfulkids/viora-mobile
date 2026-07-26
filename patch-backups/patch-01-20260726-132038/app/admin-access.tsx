import { ScrollView, StyleSheet, Text } from "react-native";

import { AdminAccessPanel } from "../components/adminAccess";
import { CommonBackButton, ErrorState, Screen } from "../components/common";
import { useAdminAccess } from "../hooks";
import { colors, spacing } from "../theme";

export default function AdminAccessScreen() {
  const adminAccess = useAdminAccess();

  if (!adminAccess.isAdmin) {
    return (
      <Screen>
        <ErrorState
          title="Admin access required"
          message="Login with an approved Viora admin account to manage beta or premium access grants."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CommonBackButton label="Settings" fallbackPath="/settings-center" />
        <Text style={styles.eyebrow}>Viora Admin</Text>
        <Text style={styles.title}>Premium Access Control</Text>
        <Text style={styles.subtitle}>Use this only for beta users, support cases, testing and manual access corrections.</Text>

        <AdminAccessPanel
          email={adminAccess.email}
          selectedPlanCode={adminAccess.selectedPlanCode}
          note={adminAccess.note}
          loading={adminAccess.loading}
          saving={adminAccess.saving}
          message={adminAccess.message}
          error={adminAccess.error}
          targetUser={adminAccess.targetUser}
          onEmailChange={adminAccess.setEmail}
          onPlanChange={adminAccess.setSelectedPlanCode}
          onNoteChange={adminAccess.setNote}
          onSearch={adminAccess.searchUser}
          onGrant={adminAccess.grantAccess}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 44,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
});
