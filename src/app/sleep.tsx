import { CalendarClock } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
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
import { useDashboard } from "../hooks";
import { useSleep } from "../hooks";
import { useAppTranslation } from "../i18n/useAppTranslation";
import { ActivityLogger } from "../services/activity";
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



export default function SleepScreen() {
  const { t } = useAppTranslation();
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
      Alert.alert(t("common.loginRequired"), t("common.loginAgain"));
      return;
    }

    try {
      await addSleep({
        sleepStart: sleepStart.toISOString(),
        sleepEnd: sleepEnd.toISOString(),
        quality,
      });

      await ActivityLogger.sleep({
        userId: currentUser.uid,
        minutes: previewMinutes,
        sleepStart: sleepStart.toISOString(),
        sleepEnd: sleepEnd.toISOString(),
        quality,
      });

      await refresh();

      Alert.alert(t("sleep.saved"), t("sleep.savedMessage"));
    } catch (error: any) {
      Alert.alert(t("sleep.saveError"), error.message || t("common.tryAgain"));
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <WellnessHeader
          title={t("sleep.title")}
          subtitle={t("sleep.subtitle")}
        />

        <SleepProgressCard sleepMinutes={data?.todayStats.sleepMinutes || 0} />

        <View style={styles.previewCard}>
          <View style={styles.previewIcon}>
            <CalendarClock size={22} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.previewLabel}>{t("sleep.preview")}</Text>
            <Text style={styles.previewValue}>
              {previewMinutes < 60 ? t("sleep.minutes", { minutes: previewMinutes }) : t("sleep.duration", { hours: Math.floor(previewMinutes / 60), minutes: previewMinutes % 60 })}
            </Text>
          </View>
        </View>

        <View style={styles.timeSection}>
          <TimePicker
            label={t("sleep.bed")}
            value={sleepStart}
            onChange={setSleepStart}
          />

          <View style={{ height: 16 }} />

          <TimePicker
            label={t("sleep.wake")}
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
  timeSection: {
    gap: spacing.md,
  },
});