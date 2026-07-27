import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Headphones } from "lucide-react-native";

import { CommonBackButton, Screen } from "../components/common";
import { PremiumJourneyHero } from "../components/premiumExperience";
import {
    MusicHistoryCard,
    MusicPlayerCard,
    MusicProgressCard,
    MusicSessionCard,
} from "../components/music";
import { useDashboard } from "../hooks";
import { useMusic } from "../hooks";
import { colors, spacing } from "../theme";

export default function MusicScreen() {
  const { data, refresh } = useDashboard();
  const { saving, catalog, history, completeSession } = useMusic();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);

  const activeSession = useMemo(
    () => catalog.find((item) => item.id === activeSessionId) || null,
    [catalog, activeSessionId]
  );

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
    }
  }, [secondsLeft, running]);

  function handleStart(sessionId: string) {
    const session = catalog.find((item) => item.id === sessionId);

    if (!session) return;

    setActiveSessionId(session.id);
    setSecondsLeft(session.durationMinutes * 60);
    setRunning(Boolean(session.audioUrl));
  }

  async function handleComplete() {
    try {
      if (!activeSession) return;

      await completeSession(activeSession.id);
      await refresh();

      setRunning(false);
      setActiveSessionId(null);
      setSecondsLeft(0);

      Alert.alert(
        "Therapy completed",
        "Your music therapy session has been saved."
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to save session",
        error.message || "Please try again."
      );
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <CommonBackButton label="Wellness" fallbackPath="/(tabs)/wellness" />
        <PremiumJourneyHero
          eyebrow="Music Therapy"
          title="Soundscapes for the state you need."
          subtitle="Use guided audio sessions for focus, calm, sleep and emotional reset, with every completed minute reflected in your wellness progress."
          icon={<Headphones size={29} color="#0369A1" />}
          colors={["#0C4A6E", "#0369A1", "#38BDF8"]}
          chips={["Focus", "Calm", "Sleep", "Mood reset"]}
        />

        <MusicProgressCard minutes={data?.todayStats.musicMinutes || 0} />

        {activeSession ? (
          <MusicPlayerCard
            title={activeSession.title}
            therapyType={activeSession.therapyType}
            audioUrl={activeSession.audioUrl}
            secondsLeft={secondsLeft}
            running={running}
            onToggle={() => setRunning((prev) => !prev)}
            onComplete={handleComplete}
          />
        ) : null}

        <Text style={styles.sectionTitle}>Therapy Sessions</Text>

        {catalog.map((session) => (
          <MusicSessionCard
            key={session.id}
            session={session}
            saving={saving}
            onStart={handleStart}
          />
        ))}

        <MusicHistoryCard history={history} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 170,
    gap: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
});
