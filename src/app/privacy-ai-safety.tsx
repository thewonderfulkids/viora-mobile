import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { SettingsInfoCard, SettingsSection, SettingsToggleRow } from "../components/settings";
import { useSettingsCenter } from "../hooks";
import { colors, spacing } from "../theme";

export default function PrivacyAISafetyScreen() {
  const { dashboard, loading, refreshing, saving, error, refresh, updatePreferences } = useSettingsCenter();

  if (loading && !dashboard) return <LoadingState message="Loading privacy controls..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load privacy controls" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Privacy controls unavailable" message="Please try again." onRetry={refresh} />;

  const prefs = dashboard.preferences;

  function requestDataExport() {
    Alert.alert(
      "Request data export",
      "Viora will mark your account for data export. Downloadable reports and export packages will be prepared through the production safety flow.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request", onPress: () => updatePreferences({ dataExportRequestedAt: new Date().toISOString() }) },
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
          title="Privacy & AI Safety"
          subtitle="Keep Viora positioned as a wellness companion, not a diagnosis or prescription tool."
        >
          <SettingsInfoCard
            title="AI safety boundary"
            subtitle="Viora can provide lifestyle coaching, habit insights and wellness summaries. It should not diagnose, prescribe medication or replace a medical professional."
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <SettingsToggleRow
            title="AI Memory"
            subtitle="Allow Viora to remember wellness patterns for personalization."
            value={prefs.aiMemoryEnabled}
            disabled={saving}
            onValueChange={(value) => updatePreferences({ aiMemoryEnabled: value })}
          />
          <SettingsToggleRow
            title="AI Personalization"
            subtitle="Use habits, nutrition, mood and routine signals to personalize coaching."
            value={prefs.aiPersonalizationEnabled}
            disabled={saving}
            onValueChange={(value) => updatePreferences({ aiPersonalizationEnabled: value })}
          />

          <SettingsInfoCard
            title="Data export"
            subtitle={prefs.dataExportRequestedAt ? `Requested on ${new Date(prefs.dataExportRequestedAt).toLocaleDateString()}` : "Generate a formal export request for reports and exports."}
          >
            <Text style={styles.actionText} onPress={requestDataExport}>Request data export →</Text>
          </SettingsInfoCard>

          {saving ? <Text style={styles.savingText}>Saving privacy controls...</Text> : null}
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },
  savingText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});
