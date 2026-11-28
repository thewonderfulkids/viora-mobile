import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { SettingsInfoCard, SettingsOptionCard, SettingsSection } from "../components/settings";
import { useSettingsCenter } from "../hooks";
import { colors, spacing } from "../theme";
import { VioraLanguageCode } from "../types";

const LANGUAGE_OPTIONS: Array<{ label: string; value: VioraLanguageCode; description: string }> = [
  { label: "English", value: "en", description: "Use English for the app interface and coaching preference." },
  { label: "Hindi", value: "hi", description: "Use Hindi for translated app screens and coaching preference." },
  { label: "Hinglish", value: "hinglish", description: "Conversational Hindi-English coaching tone; keeps the current interface language." },
];

export default function LanguageSettingsScreen() {
  const { dashboard, loading, refreshing, saving, error, refresh, updatePreferences } = useSettingsCenter();

  if (loading && !dashboard) return <LoadingState message="Loading language settings..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load language" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Language unavailable" message="Please try again." onRetry={refresh} />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Profile" fallbackPath="/(tabs)" />

        <SettingsSection
          title="Language"
          subtitle="Choose how Viora should communicate across coaching, reminders and future voice AI."
        >
          <SettingsInfoCard
            title="Language foundation"
            subtitle="English and Hindi switch translated app screens. Hinglish changes the coaching preference only. Some content is still available in English."
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {LANGUAGE_OPTIONS.map((option) => (
            <SettingsOptionCard
              key={option.value}
              label={option.label}
              value={option.value}
              description={option.description}
              selected={dashboard.preferences.language === option.value}
              onSelect={(value) => updatePreferences({ language: value })}
            />
          ))}

          {saving ? <Text style={styles.savingText}>Saving preference...</Text> : null}
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
