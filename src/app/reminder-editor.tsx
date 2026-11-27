import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommonBackButton, Screen } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";
import {
  deletePremiumReminder,
  getPremiumReminders,
  PremiumReminderCategory,
  upsertPremiumReminder,
} from "../services/notifications2";
import { premiumPalette, premiumShadow } from "../theme/premium";

const CATEGORIES: Array<{
  value: PremiumReminderCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: "hydration", label: "Hydration", icon: "water-outline" },
  { value: "steps", label: "Steps", icon: "footsteps-outline" },
  { value: "workout", label: "Workout", icon: "barbell-outline" },
  { value: "meditation", label: "Meditation", icon: "leaf-outline" },
  { value: "sleep", label: "Sleep", icon: "moon-outline" },
  { value: "habit", label: "Habit", icon: "checkmark-circle-outline" },
  { value: "morning", label: "Morning", icon: "sunny-outline" },
  { value: "night", label: "Night", icon: "sparkles-outline" },
];

const WEEKDAYS = [
  { value: 2, label: "M" },
  { value: 3, label: "T" },
  { value: 4, label: "W" },
  { value: 5, label: "T" },
  { value: 6, label: "F" },
  { value: 7, label: "S" },
  { value: 1, label: "S" },
];

export default function ReminderEditorScreen() {
  const { user, authSessionId } = useAuth();
  if (!user) return null;
  return <AccountReminderEditor key={authSessionId} />;
}

function AccountReminderEditor() {
  const { user } = useAuth();
  const mounted = useRef(true);
  const isCurrent = () => mounted.current && Boolean(user && auth.currentUser === user);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;

  const [category, setCategory] =
    useState<PremiumReminderCategory>("hydration");
  const [time, setTime] = useState(() => {
    const date = new Date();
    date.setHours(11, 0, 0, 0);
    return date;
  });
  const [weekdays, setWeekdays] = useState<number[]>([1,2,3,4,5,6,7]);
  const [enabled, setEnabled] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (!id || !user) return;
    let active = true;

    void getPremiumReminders(user).then((items) => {
      if (!active || auth.currentUser !== user) return;
      const reminder = items.find((item) => item.id === id);
      if (!reminder) return;

      setCategory(reminder.category);
      setEnabled(reminder.enabled);
      setWeekdays(reminder.weekdays);
      setSound(reminder.sound);
      setVibration(reminder.vibration);

      const next = new Date();
      next.setHours(reminder.hour, reminder.minute, 0, 0);
      setTime(next);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [id, user]);

  const formattedTime = useMemo(
    () =>
      time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [time],
  );

  function toggleWeekday(value: number) {
    setWeekdays((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function save() {
    if (!isCurrent()) return;
    setSaving(true);
    try {
      await upsertPremiumReminder({
        id,
        category,
        hour: time.getHours(),
        minute: time.getMinutes(),
        weekdays,
        enabled,
        sound,
        vibration,
      }, user);
      if (isCurrent()) router.back();
    } catch (reason) {
      if (!isCurrent()) return;
      Alert.alert(
        "Could not save reminder",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    } finally {
      if (isCurrent()) setSaving(false);
    }
  }

  async function remove() {
    if (!id || !isCurrent()) return;

    Alert.alert(
      "Delete reminder?",
      "This removes all scheduled notifications for this reminder.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!isCurrent()) return;
            try {
              await deletePremiumReminder(id, user);
              if (isCurrent()) router.back();
            } catch {
              if (isCurrent()) Alert.alert("Could not delete reminder", "Please try again.");
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CommonBackButton />

          <View style={styles.header}>
            <Text style={styles.eyebrow}>REMINDER EDITOR</Text>
            <Text style={styles.title}>
              {isEditing ? "Edit your wellness nudge" : "Create a wellness nudge"}
            </Text>
            <Text style={styles.subtitle}>
              Choose what Viora should remind you about and when.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((item) => {
                const selected = category === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setCategory(item.value)}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={21}
                      color={
                        selected
                          ? premiumPalette.white
                          : premiumPalette.emerald
                      }
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        selected && styles.categoryLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>TIME</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
            <DateTimePicker
              mode="time"
              value={time}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, value) => value && setTime(value)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>REPEAT DAYS</Text>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((item, index) => {
                const selected = weekdays.includes(item.value);
                return (
                  <Pressable
                    key={`${item.value}-${index}`}
                    onPress={() => toggleWeekday(item.value)}
                    style={[
                      styles.dayButton,
                      selected && styles.dayButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <SettingRow
              icon="notifications-outline"
              title="Reminder enabled"
              value={enabled}
              onChange={setEnabled}
            />
            <SettingRow
              icon="volume-high-outline"
              title="Sound"
              value={sound}
              onChange={setSound}
            />
            <SettingRow
              icon="phone-portrait-outline"
              title="Vibration"
              value={vibration}
              onChange={setVibration}
            />
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={save}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={20} color={premiumPalette.white} />
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save reminder"}
            </Text>
          </Pressable>

          {isEditing ? (
            <Pressable style={styles.deleteButton} onPress={remove}>
              <Ionicons name="trash-outline" size={18} color={premiumPalette.coral} />
              <Text style={styles.deleteText}>Delete reminder</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function SettingRow({
  icon,
  title,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={premiumPalette.emerald} />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#D8E7DF", true: "#72D1A8" }}
        thumbColor={premiumPalette.white}
      />
    </View>
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
  header: {
    borderRadius: 29,
    padding: 23,
    backgroundColor: premiumPalette.forest,
    ...premiumShadow.hero,
  },
  eyebrow: {
    color: premiumPalette.lime,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    color: premiumPalette.white,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.9,
  },
  subtitle: {
    marginTop: 9,
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: premiumPalette.white,
    borderWidth: 1,
    borderColor: premiumPalette.line,
    ...premiumShadow.card,
  },
  label: {
    color: premiumPalette.emerald,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  categoryGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    width: "48%",
    minHeight: 77,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: premiumPalette.canvas,
    borderWidth: 1,
    borderColor: premiumPalette.line,
  },
  categoryButtonSelected: {
    backgroundColor: premiumPalette.emerald,
    borderColor: premiumPalette.emerald,
  },
  categoryLabel: {
    color: premiumPalette.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  categoryLabelSelected: { color: premiumPalette.white },
  timeText: {
    marginTop: 14,
    color: premiumPalette.ink,
    fontSize: 34,
    fontWeight: "900",
  },
  weekRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayButton: {
    width: 39,
    height: 39,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: premiumPalette.canvas,
    borderWidth: 1,
    borderColor: premiumPalette.line,
  },
  dayButtonSelected: {
    backgroundColor: premiumPalette.emerald,
    borderColor: premiumPalette.emerald,
  },
  dayText: {
    color: premiumPalette.inkMuted,
    fontSize: 11,
    fontWeight: "900",
  },
  dayTextSelected: { color: premiumPalette.white },
  settingRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  settingIcon: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: premiumPalette.mintSoft,
  },
  settingTitle: {
    flex: 1,
    color: premiumPalette.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: premiumPalette.emerald,
  },
  saveText: {
    color: premiumPalette.white,
    fontSize: 14,
    fontWeight: "900",
  },
  deleteButton: {
    minHeight: 50,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF1EF",
  },
  deleteText: {
    color: premiumPalette.coral,
    fontSize: 13,
    fontWeight: "900",
  },
});
