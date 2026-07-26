import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
  captureVoiceCommand,
  getTextToSpeechSupport,
  getVoiceAIDashboard,
  runVoiceCommand,
  speakVoiceResponse,
  stopVoiceResponse,
} from "../services";
import { VoiceAIDashboard, VoiceCommandResult, VoiceProviderStatus } from "../types";

type UseVoiceAIOptions = {
  autoNavigate?: boolean;
};

export function useVoiceAI(options: UseVoiceAIOptions = {}) {
  const { autoNavigate = false } = options;

  const [dashboard, setDashboard] = useState<VoiceAIDashboard | null>(null);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<VoiceProviderStatus>("idle");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      setError("Please login again.");
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const nextDashboard = await getVoiceAIDashboard(currentUser.uid);
      setDashboard(nextDashboard);
      setStatus(nextDashboard.status);
    } catch (error: any) {
      setError(error?.message || "Unable to load Voice AI.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const navigateForResult = useCallback(
    (result: VoiceCommandResult) => {
      if (!autoNavigate || !result.targetRoute) return;

      const shouldNavigate =
        result.intent.type === "navigation" || result.intent.type === "read_report";

      if (!shouldNavigate) return;

      router.push({ pathname: result.targetRoute as never });
    },
    [autoNavigate]
  );

  const speakResult = useCallback((result: VoiceCommandResult) => {
    if (!getTextToSpeechSupport()) return;

    const didSpeak = speakVoiceResponse(result.spokenResponse);

    if (didSpeak) {
      setSpeaking(true);

      if (typeof window !== "undefined") {
        window.setTimeout(
          () => setSpeaking(false),
          Math.min(Math.max(result.spokenResponse.length * 80, 1200), 6000)
        );
      }
    }
  }, []);

  const submitCommand = useCallback(
    async (
      commandText = transcript,
      provider: "browser" | "native" | "manual" | "mock" = "manual"
    ) => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Please login again.");
        return null;
      }

      if (!commandText.trim()) {
        setError("Please say or type a command first.");
        return null;
      }

      setSaving(true);
      setStatus("processing");
      setError(null);

      try {
        const result = await runVoiceCommand({
          userId: currentUser.uid,
          transcript: commandText,
          provider,
        });

        setTranscript(result.transcript);
        speakResult(result);
        await refresh();
        navigateForResult(result);
        return result;
      } catch (error: any) {
        setError(error?.message || "Unable to process voice command.");
        setStatus("error");
        return null;
      } finally {
        setSaving(false);
        setStatus("idle");
      }
    },
    [navigateForResult, refresh, speakResult, transcript]
  );

  const startListening = useCallback(async () => {
    setStatus("listening");
    setError(null);

    try {
      const captured = await captureVoiceCommand();
      setTranscript(captured.transcript);
      return await submitCommand(captured.transcript, captured.provider);
    } catch (error: any) {
      setError(
        error?.message ||
          "Voice capture is not available. You can type a command instead."
      );
      setStatus("unsupported");
      return null;
    }
  }, [submitCommand]);

  const stopSpeaking = useCallback(() => {
    stopVoiceResponse();
    setSpeaking(false);
  }, []);

  return {
    dashboard,
    transcript,
    status,
    loading,
    refreshing,
    saving,
    speaking,
    error,
    setTranscript,
    refresh,
    startListening,
    submitCommand,
    stopSpeaking,
  };
}
