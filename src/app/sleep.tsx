import { router } from "expo-router";
import { CalendarClock } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen, TimePicker } from "../components/common";
import {
  SleepHistoryCard,
  SleepLogCard,
  SleepProgressCard,
  SleepQualityCard,
} from "../components/sleep";
import { WellnessHeader } from "../components/wellness";
import { auth } from "../firebase/firebaseConfig";
import { SleepQuality } from "../firebase/firestoreTypes";
import { useDashboard } from "../hooks/useDashboard";
import { useSleep } from "../hooks/useSleep";
import { logWellnessActivity } from "../services/activity/activityService";
import { colors, radius, spacing } from "../theme";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculatePreviewMinutes(start: Date, end: Date) {
  let minutes = Math.round((end.getTime() - start.getTime()) / 60000);

  if (minutes < 0) {
    minutes += 24 * 60;
  }

  return minutes;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) return `${mins} min`;

  return `${hours}h ${mins}m`;
}

export default function SleepScreen() {
  const { data, refresh } = useDashboard();
  const { saving, history, addSleep } = useSleep();

  const [sleepStart, setSleepStart] = useState(() => {
    const date = new Date();
    date.setHours(23, 0, 0, 0);
    return date;
  });

  const [sleepEnd, setSleepEnd] = useState(() => {
    const date = new Date();
    date.setHours(7, 0, 0, 0);
    return date;
  });

  const [quality, setQuality] = useState<SleepQuality>("Good");

  const previewMinutes = useMemo(
    () => calculatePreviewMinutes(sleepStart, sleepEnd),
    [sleepStart, sleepEnd]
  );

  async function handleSave() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    try {
      await addSleep({
        sleepStart: sleepStart.toISOString(),
        sleepEnd: sleepEnd.toISOString(),
        quality,
      });

      await logWellnessActivity({
        userId: currentUser.uid,
        type: "sleep",
        value: previewMinutes,
        unit: "minutes",
        source: "manual",
        note: "Sleep logged",
        metadata: {
          sleepStart: sleepStart.toISOString(),
          sleepEnd: sleepEnd.toISOString(),
          quality,
        },
      });

      await refresh();

      Alert.alert("Sleep saved", "Your sleep log has been updated.");
    } catch (error: any) {
      Alert.alert("Unable to save sleep", error.message || "Please try again.");
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <WellnessHeader
          title="Sleep Tracker"
          subtitle="Log your bedtime, wake time and sleep quality."
        />

        <SleepProgressCard sleepMinutes={data?.todayStats.sleepMinutes || 0} />

        <View style={styles.previewCard}>
          <View style={styles.previewIcon}>
            <CalendarClock size={22} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.previewLabel}>Preview Duration</Text>
            <Text style={styles.previewValue}>
              {formatDuration(previewMinutes)}
            </Text>
          </View>
        </View>

        <View style={styles.timeSection}>
          <TimePicker
            label="Bed Time"
            value={sleepStart}
            onChange={setSleepStart}
          />

          <View style={{ height: 16 }} />

          <TimePicker
            label="Wake Time"
            value={sleepEnd}
            onChange={setSleepEnd}
          />

          <View style={{ height: 20 }} />

          <SleepLogCard
            sleepStart={formatTime(sleepStart)}
            sleepEnd={formatTime(sleepEnd)}
            onPickSleepStart={() => {}}
            onPickSleepEnd={() => {}}
            onSave={handleSave}
            saving={saving}
          />
        </View>

        <SleepQualityCard selected={quality} onSelect={setQuality} />

        <SleepHistoryCard history={history} />

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={styles.homeButton}
        >
          <Text style={styles.homeButtonText}>Back to Dashboard</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 40,
    gap: spacing.md,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  previewLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
  },
  previewValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  homeButton: {
    backgroundColor: colors.text,
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: "center",
  },
  timeSection: {
    gap: spacing.md,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});