import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { SettingsInfoCard, SettingsSection, SettingsToggleRow } from "../components/settings";
import { useSettingsCenter } from "../hooks";
import { colors, spacing } from "../theme";

export default function NotificationPreferencesScreen() {
  const { dashboard, loading, refreshing, saving, error, refresh, updatePreferences } = useSettingsCenter();

  if (loading && !dashboard) return <LoadingState message="Loading notification preferences..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load notifications" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Notifications unavailable" message="Please try again." onRetry={refresh} />;

  const prefs = dashboard.preferences;
  const disabled = saving || !prefs.smartNotificationsEnabled;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Profile" fallbackPath="/(tabs)" />

        <SettingsSection
          title="Smart Notification Preferences"
          subtitle="Control the reminder categories Viora can use for hydration, sleep, movement, nutrition and mood check-ins."
        >
          <SettingsInfoCard
            title={prefs.smartNotificationsEnabled ? "Smart notifications are active" : "Smart notifications are paused"}
            subtitle="These preferences feed the existing Smart Notifications engine and future voice reminders."
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <SettingsToggleRow
            title="Enable smart notifications"
            subtitle="Master switch for all personalized reminders."
            value={prefs.smartNotificationsEnabled}
            disabled={saving}
            onValueChange={(value) => updatePreferences({ smartNotificationsEnabled: value })}
          />
          <SettingsToggleRow
            title="Hydration reminders"
            subtitle="Water reminders based on routine and hydration rhythm."
            value={prefs.hydrationRemindersEnabled}
            disabled={disabled}
            onValueChange={(value) => updatePreferences({ hydrationRemindersEnabled: value })}
          />
          <SettingsToggleRow
            title="Sleep routine reminders"
            subtitle="Wind-down and sleep consistency nudges."
            value={prefs.sleepRemindersEnabled}
            disabled={disabled}
            onValueChange={(value) => updatePreferences({ sleepRemindersEnabled: value })}
          />
          <SettingsToggleRow
            title="Yoga reminders"
            subtitle="Gentle prompts for movement and flexibility."
            value={prefs.yogaRemindersEnabled}
            disabled={disabled}
            onValueChange={(value) => updatePreferences({ yogaRemindersEnabled: value })}
          />
          <SettingsToggleRow
            title="Nutrition reminders"
            subtitle="Meal logging and healthy eating prompts."
            value={prefs.nutritionRemindersEnabled}
            disabled={disabled}
            onValueChange={(value) => updatePreferences({ nutritionRemindersEnabled: value })}
          />
          <SettingsToggleRow
            title="Mood check-ins"
            subtitle="Mental wellness check-ins without medical diagnosis."
            value={prefs.moodCheckInRemindersEnabled}
            disabled={disabled}
            onValueChange={(value) => updatePreferences({ moodCheckInRemindersEnabled: value })}
          />

          {saving ? <Text style={styles.savingText}>Saving preferences...</Text> : null}
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
});
