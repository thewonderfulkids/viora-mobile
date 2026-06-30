import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { SettingsInfoCard, SettingsSection } from "../components/settings";
import { useSettingsCenter } from "../hooks";
import { colors, spacing } from "../theme";

export default function DeleteAccountScreen() {
  const { dashboard, loading, refreshing, saving, error, refresh, updatePreferences } = useSettingsCenter();

  if (loading && !dashboard) return <LoadingState message="Loading account deletion controls..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load delete account" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Delete account unavailable" message="Please try again." onRetry={refresh} />;

  function requestDeleteAccount() {
    Alert.alert(
      "Request account deletion",
      "This will mark your account for deletion review. Permanent deletion will be handled through the production safety flow in Sprint 25.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request deletion", style: "destructive", onPress: () => updatePreferences({ deleteAccountRequestedAt: new Date().toISOString() }) },
      ]
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Profile" fallbackPath="/(tabs)" />

        <SettingsSection
          title="Delete Account"
          subtitle="Account deletion is intentionally handled as a safe request flow before production hard deletion."
        >
          <SettingsInfoCard
            title="Deletion status"
            subtitle={dashboard.preferences.deleteAccountRequestedAt ? `Requested on ${new Date(dashboard.preferences.deleteAccountRequestedAt).toLocaleDateString()}` : "No deletion request is active."}
          />
          <SettingsInfoCard
            title="Safety note"
            subtitle="Viora will never use this flow for accidental deletion. Final production hard-delete will be added during launch hardening."
          >
            <Text style={styles.deleteText} onPress={requestDeleteAccount}>Request account deletion →</Text>
          </SettingsInfoCard>
          {saving ? <Text style={styles.savingText}>Saving request...</Text> : null}
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
  deleteText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  savingText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
});
