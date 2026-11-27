import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";

import { Screen } from "../components/common";
import { WorkoutVideoPlayer } from "../components/media";
import { WellnessHeader } from "../components/wellness";
import {
  YogaHistoryCard,
  YogaProgressCard,
  YogaSessionCard,
  YogaSessionPreviewCard,
  YogaTimerCard,
} from "../components/yoga";
import { auth } from "../firebase/firebaseConfig";
import { useDashboard } from "../hooks";
import { useYoga } from "../hooks";
import { ActivityLogger } from "../services/activity";
import { colors, spacing } from "../theme";

export default function YogaScreen() {
  const { data, refresh } = useDashboard();
  const { saving, catalog, history, completeSession } = useYoga();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [videoDismissed, setVideoDismissed] = useState(false);

  const activeSession = useMemo(
    () => catalog.find((item) => item.id === activeSessionId) || null,
    [catalog, activeSessionId]
  );

  const currentStep = useMemo(() => {
    if (!activeSession) return null;
    return activeSession.steps[currentStepIndex] ?? null;
  }, [activeSession, currentStepIndex]);

  // Prefer an individually mapped pose; fall back to the session video.
  const poseVideoUrl = currentStep?.videoUrl?.trim();
  const videoUrl = poseVideoUrl || activeSession?.videoUrl?.trim();

  const totalSteps = activeSession?.steps.length ?? 0;

  const previewSession = useMemo(
    () => catalog.find((item) => item.id === previewSessionId) || null,
    [catalog, previewSessionId]
  );

  const activeSessionMinutes = useMemo(() => {
    if (!activeSession) return 0;

    const totalSeconds = activeSession.steps.reduce(
      (sum, step) => sum + step.durationSeconds,
      0
    );

    return Math.max(1, Math.round(totalSeconds / 60));
  }, [activeSession]);

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

    const firstStep = session?.steps[0];
    if (!session || !firstStep) return;

    setPreviewSessionId(null);
    setActiveSessionId(session.id);
    setVideoDismissed(false);
    setCurrentStepIndex(0);
    setSecondsLeft(firstStep.durationSeconds);
    setRunning(true);
  }

  async function handleComplete() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    try {
      if (!activeSession) return;

      await completeSession(activeSession.id);

      await ActivityLogger.yoga({
        userId: currentUser.uid,
        minutes: activeSessionMinutes,
        sessionId: activeSession.id,
        title: activeSession.title,
        steps: totalSteps,
      });

      await refresh();

      setRunning(false);
      setActiveSessionId(null);
      setSecondsLeft(0);
      setCurrentStepIndex(0);

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

        {activeSession && videoUrl && !videoDismissed ? (
          <WorkoutVideoPlayer
            key={JSON.stringify([activeSession.id, poseVideoUrl ? currentStepIndex : "session", videoUrl])}
            title={poseVideoUrl ? currentStep?.title || activeSession.title : activeSession.title}
            url={videoUrl}
            onClose={() => setVideoDismissed(true)}
          />
        ) : null}

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
});
