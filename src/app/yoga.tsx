import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { Screen } from "../components/common";
import { WellnessHeader } from "../components/wellness";
import {
    YogaHistoryCard,
    YogaProgressCard,
    YogaSessionCard,
    YogaSessionPreviewCard,
    YogaTimerCard,
} from "../components/yoga";
import { useDashboard } from "../hooks/useDashboard";
import { useYoga } from "../hooks/useYoga";
import { colors, radius, spacing } from "../theme";

export default function YogaScreen() {
  const { data, refresh } = useDashboard();
  const { saving, catalog, history, completeSession } = useYoga();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [running, setRunning] = useState(false);

  const activeSession = useMemo(
    () => catalog.find((item) => item.id === activeSessionId) || null,
    [catalog, activeSessionId]
  );

  const currentStep = useMemo(() => {
    if (!activeSession) return null;
    return activeSession.steps[currentStepIndex] ?? null;
    }, [activeSession, currentStepIndex]);

  const totalSteps = activeSession?.steps.length ?? 0;

  const previewSession = useMemo(
    () => catalog.find((item) => item.id === previewSessionId) || null,
    [catalog, previewSessionId]
  );

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (!activeSession || !running || secondsLeft !== 0) return;

    const nextStepIndex = currentStepIndex + 1;
    const nextStep = activeSession.steps[nextStepIndex];

    if (nextStep) {
        setCurrentStepIndex(nextStepIndex);
        setSecondsLeft(nextStep.durationSeconds);
        return;
    }

    setRunning(false);
    }, [secondsLeft, running, activeSession, currentStepIndex]);

  function handlePreview(sessionId: string) {
  setPreviewSessionId(sessionId);
}

function handleStart(sessionId: string) {
  const session = catalog.find((item) => item.id === sessionId);

  if (!session) return;

  setPreviewSessionId(null);
  setActiveSessionId(session.id);
  setCurrentStepIndex(0);
  setSecondsLeft(session.steps[0].durationSeconds);
  setRunning(true);
}

  async function handleComplete() {
    try {
      if (!activeSession) return;

      await completeSession(activeSession.id);
      await refresh();

      setRunning(false);
      setActiveSessionId(null);
      setSecondsLeft(0);

      Alert.alert("Session completed", "Great job. Your movement is logged.");
    } catch (error: any) {
      Alert.alert(
        "Unable to complete session",
        error.message || "Please try again."
      );
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <WellnessHeader
          title="Yoga & Movement"
          subtitle="Choose a short session and build a consistent daily routine."
        />

        <YogaProgressCard
          minutes={data?.todayStats.yogaMinutes || 0}
          sessions={data?.todayStats.yogaSessions || 0}
        />

        {activeSession ? (
          <YogaTimerCard
            title={activeSession.title}
            poseName={currentStep?.title ?? ""}
            currentStep={currentStepIndex + 1}
            totalSteps={totalSteps}
            secondsLeft={secondsLeft}
            running={running}
            onToggle={() => setRunning((prev) => !prev)}
            onComplete={handleComplete}
            />
        ) : null}

        {previewSession && !activeSession ? (
            <YogaSessionPreviewCard
                session={previewSession}
                onClose={() => setPreviewSessionId(null)}
                onStart={() => handleStart(previewSession.id)}
            />
        ) : null}

        <Text style={styles.sectionTitle}>Recommended Sessions</Text>

        {catalog.map((session) => (
          <YogaSessionCard
            key={session.id}
            session={session}
            saving={saving}
            onStart={handlePreview}
          />
        ))}

        <YogaHistoryCard history={history} />

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
  sectionTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  homeButton: {
    backgroundColor: colors.text,
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});