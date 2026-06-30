import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { SettingsInfoCard, SettingsSection } from "../components/settings";
import { auth } from "../firebase/firebaseConfig";
import { useSettingsCenter } from "../hooks";
import { colors, spacing } from "../theme";

export default function AccountSecurityScreen() {
  const { dashboard, loading, refreshing, error, refresh } = useSettingsCenter();

  if (loading && !dashboard) return <LoadingState message="Loading account security..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load security" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Security unavailable" message="Please try again." onRetry={refresh} />;

  async function sendPasswordReset() {
    const email = dashboard?.security.email;
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password reset sent", "Please check your email for the reset link.");
    } catch (err: any) {
      Alert.alert("Unable to send reset", err?.message || "Please try again.");
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Profile" fallbackPath="/(tabs)" />

        <SettingsSection
          title="Account Security"
          subtitle="Manage login safety, password reset and future 2FA-ready account protection."
        >
          <SettingsInfoCard
            title="Login email"
            subtitle={dashboard.security.email || "No email available"}
          />
          <SettingsInfoCard
            title="Email verification"
            subtitle={dashboard.security.emailVerified ? "Verified" : "Not verified yet"}
          />
          <SettingsInfoCard
            title="Password reset"
            subtitle={dashboard.security.passwordChangeAvailable ? "Send a secure password reset email." : "Password reset is managed by your sign-in provider."}
          >
            {dashboard.security.passwordChangeAvailable ? (
              <Text style={styles.actionText} onPress={sendPasswordReset}>Send password reset email →</Text>
            ) : null}
          </SettingsInfoCard>
          <SettingsInfoCard
            title="Two-factor authentication"
            subtitle="2FA-ready architecture is reserved for a future security upgrade."
          />
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 44,
    gap: spacing.xl,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});
