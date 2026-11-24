import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommonBackButton, Screen } from "../components/common";
import { usePremiumNotifications } from "../hooks/usePremiumNotifications";
import { PremiumReminderCategory } from "../services/notifications2";
import { premiumPalette, premiumShadow } from "../theme/premium";

const CATEGORY_ICON: Record<
  PremiumReminderCategory,
  keyof typeof Ionicons.glyphMap
> = {
  hydration: "water-outline",
  meditation: "leaf-outline",
  sleep: "moon-outline",
  workout: "barbell-outline",
  steps: "footsteps-outline",
  habit: "checkmark-circle-outline",
  morning: "sunny-outline",
  night: "sparkles-outline",
};

export default function NotificationCenterScreen() {
  const {
    reminders,
    settings,
    loading,
    error,
    toggle,
    saveSettings,
  } = usePremiumNotifications();

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CommonBackButton />

          <View style={styles.hero}>
            <View style={styles.heroOrb} />
            <View style={styles.heroIcon}>
              <Ionicons name="notifications" size={28} color={premiumPalette.lime} />
            </View>
            <Text style={styles.eyebrow}>PREMIUM REMINDERS 2.0</Text>
            <Text style={styles.title}>Wellness nudges that feel human.</Text>
            <Text style={styles.subtitle}>
              Schedule hydration, movement, sleep and mindful check-ins with quiet-hour protection.
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/reminder-editor" as never)}
            >
              <Ionicons name="add" size={20} color={premiumPalette.forest} />
              <Text style={styles.addText}>Create reminder</Text>
            </Pressable>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsCopy}>
              <Text style={styles.settingsTitle}>Quiet hours</Text>
              <Text style={styles.settingsText}>
                Block new reminder schedules between {settings.quietStartHour}:00 and {settings.quietEndHour}:00.
              </Text>
            </View>
            <Switch
              value={settings.quietHoursEnabled}
              onValueChange={(value) =>
                saveSettings({ ...settings, quietHoursEnabled: value })
              }
              trackColor={{ false: "#D8E7DF", true: "#72D1A8" }}
              thumbColor={premiumPalette.white}
            />
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>YOUR SCHEDULE</Text>
              <Text style={styles.sectionTitle}>Upcoming reminders</Text>
            </View>
            <Text style={styles.count}>{reminders.length}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={premiumPalette.emerald} />
          ) : reminders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="notifications-off-outline" size={30} color={premiumPalette.emerald} />
              <Text style={styles.emptyTitle}>No reminders yet</Text>
              <Text style={styles.emptyText}>
                Create your first wellness reminder and Viora will take care of the schedule.
              </Text>
            </View>
          ) : (
            reminders.map((item) => (
              <Pressable
                key={item.id}
                style={styles.reminderCard}
                onPress={() =>
                  router.push({
                    pathname: "/reminder-editor" as never,
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.reminderIcon}>
                  <Ionicons
                    name={CATEGORY_ICON[item.category]}
                    size={22}
                    color={premiumPalette.emerald}
                  />
                </View>

                <View style={styles.reminderCopy}>
                  <Text style={styles.reminderTitle}>{item.title}</Text>
                  <Text style={styles.reminderBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.reminderMeta}>
                    {String(item.hour).padStart(2, "0")}:
                    {String(item.minute).padStart(2, "0")} ·{" "}
                    {item.weekdays.length === 7
                      ? "Every day"
                      : `${item.weekdays.length} days/week`}
                  </Text>
                </View>

                <Switch
                  value={item.enabled}
                  onValueChange={(enabled) => toggle(item.id, enabled)}
                  trackColor={{ false: "#D8E7DF", true: "#72D1A8" }}
                  thumbColor={premiumPalette.white}
                />
              </Pressable>
            ))
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={23} color={premiumPalette.sky} />
            <Text style={styles.infoText}>
              If a reminder set on an older version does not open its screen, edit and save the reminder again. Android may delay delivery in battery-saving modes.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 130,
    gap: 17,
  },
  hero: {
    minHeight: 315,
    borderRadius: 31,
    padding: 24,
    overflow: "hidden",
    backgroundColor: premiumPalette.forest,
    ...premiumShadow.hero,
  },
  heroOrb: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(215,245,139,0.10)",
    top: -120,
    right: -80,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  eyebrow: {
    marginTop: 25,
    color: premiumPalette.lime,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 7,
    maxWidth: 310,
    color: premiumPalette.white,
    fontSize: 33,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 315,
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  addButton: {
    alignSelf: "flex-start",
    marginTop: 22,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: premiumPalette.lime,
  },
  addText: {
    color: premiumPalette.forest,
    fontSize: 13,
    fontWeight: "900",
  },
  settingsCard: {
    borderRadius: 23,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: premiumPalette.white,
    borderWidth: 1,
    borderColor: premiumPalette.line,
    ...premiumShadow.card,
  },
  settingsCopy: { flex: 1 },
  settingsTitle: {
    color: premiumPalette.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  settingsText: {
    marginTop: 4,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    color: premiumPalette.emerald,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    marginTop: 4,
    color: premiumPalette.ink,
    fontSize: 23,
    fontWeight: "900",
  },
  count: {
    color: premiumPalette.inkMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  reminderCard: {
    borderRadius: 23,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: premiumPalette.white,
    borderWidth: 1,
    borderColor: premiumPalette.line,
    ...premiumShadow.card,
  },
  reminderIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: premiumPalette.mintSoft,
  },
  reminderCopy: { flex: 1 },
  reminderTitle: {
    color: premiumPalette.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  reminderBody: {
    marginTop: 3,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  reminderMeta: {
    marginTop: 7,
    color: premiumPalette.emerald,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    backgroundColor: premiumPalette.white,
    borderWidth: 1,
    borderColor: premiumPalette.line,
  },
  emptyTitle: {
    marginTop: 12,
    color: premiumPalette.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    maxWidth: 280,
    color: premiumPalette.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  error: {
    color: premiumPalette.coral,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  infoCard: {
    borderRadius: 21,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EDF8FD",
    borderWidth: 1,
    borderColor: "rgba(121,201,242,0.25)",
  },
  infoText: {
    flex: 1,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },
});
