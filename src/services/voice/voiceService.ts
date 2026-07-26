import { getVoiceCommandsByUser } from "../../repositories";
import { VoiceAICapability, VoiceAIDashboard, VoiceQuickAction } from "../../types";
import { captureSpeech, supportsSpeechRecognition } from "./speechToText";
import { speakText, stopSpeaking, supportsBrowserTextToSpeech } from "./textToSpeech";
import { processVoiceCommand } from "./voiceCommandEngine";

const QUICK_ACTIONS: VoiceQuickAction[] = [
  { id: "water", icon: "💧", label: "Log water", command: "I drank 500 ml water", helper: "Adds water instantly" },
  { id: "reports", icon: "📄", label: "Show report", command: "Show my weekly report", helper: "Opens report center" },
  { id: "nutrition", icon: "🍎", label: "Log meal", command: "I had tea and two bread slices", helper: "Opens nutrition confirmation" },
  { id: "mood", icon: "😌", label: "Log mood", command: "I am feeling stressed today", helper: "Opens mood check-in" },
  { id: "coach", icon: "🤖", label: "Ask coach", command: "What should I focus on today?", helper: "Opens AI Coach" },
  { id: "habits", icon: "🎯", label: "Goals", command: "Show my habits", helper: "Opens goals & habits" },
];

const CAPABILITIES: VoiceAICapability[] = [
  { id: "native_stt", title: "Native speech-to-text", description: "Android and iOS native speech recognition with browser fallback on web.", status: "active" },
  { id: "voice_navigation", title: "Voice navigation", description: "Open reports, nutrition, mental wellness, reminders, dashboard and AI Coach by command.", status: "active" },
  { id: "hydration_logging", title: "Hydration logging", description: "Commands like 'I drank 500 ml water' update hydration immediately.", status: "active" },
  { id: "confirmation_logging", title: "Safe confirmation logging", description: "Nutrition, mood, sleep and goals open the right screen for confirmation before saving.", status: "ready" },
];

export async function getVoiceAIDashboard(userId: string): Promise<VoiceAIDashboard> {
  const history = await getVoiceCommandsByUser(userId, 12);
  const speechSupported = supportsSpeechRecognition();

  return {
    status: speechSupported ? "idle" : "unsupported",
    providerLabel: speechSupported ? "Native Speech Provider" : "Manual command mode",
    lastTranscript: history[0]?.transcript || "",
    lastResult: history[0] || null,
    quickActions: QUICK_ACTIONS,
    capabilities: CAPABILITIES,
    history,
    aiCoachContext: "Voice AI can route commands, log hydration, open AI Coach and prepare safe confirmation flows for nutrition, mood, sleep and goals.",
  };
}

export async function captureVoiceCommand(language = "en-IN") {
  return captureSpeech(language);
}

export async function runVoiceCommand(input: {
  userId: string;
  transcript: string;
  provider: "browser" | "native" | "manual" | "mock";
}) {
  return processVoiceCommand(input);
}

export function speakVoiceResponse(text: string, language = "en-IN") {
  return speakText(text, language);
}

export function stopVoiceResponse() {
  stopSpeaking();
}

export function getTextToSpeechSupport() {
  return supportsBrowserTextToSpeech();
}
