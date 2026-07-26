import { Platform } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionErrorEvent,
  type ExpoSpeechRecognitionResultEvent,
} from "expo-speech-recognition";

export type SpeechCaptureResult = {
  transcript: string;
  provider: "browser" | "native" | "manual" | "mock";
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export function supportsBrowserSpeechRecognition() {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  const anyWindow = window as any;
  return Boolean(anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition);
}

export function supportsNativeSpeechRecognition() {
  if (Platform.OS === "web") return false;
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

export function supportsSpeechRecognition() {
  return Platform.OS === "web" ? supportsBrowserSpeechRecognition() : supportsNativeSpeechRecognition();
}

export function captureSpeechFromBrowser(language = "en-IN"): Promise<SpeechCaptureResult> {
  if (!supportsBrowserSpeechRecognition()) {
    return Promise.reject(new Error("Speech recognition is not available in this browser."));
  }

  const anyWindow = window as any;
  const Recognition = anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition;
  const recognition: BrowserSpeechRecognition = new Recognition();

  recognition.lang = language;
  recognition.interimResults = false;
  recognition.continuous = false;

  return new Promise((resolve, reject) => {
    let resolved = false;

    recognition.onresult = (event: any) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript || "").trim();
      if (!transcript) return;
      resolved = true;
      recognition.stop();
      resolve({ transcript, provider: "browser" });
    };

    recognition.onerror = (event: any) => {
      if (!resolved) reject(new Error(event?.error || "Voice capture failed."));
    };

    recognition.onend = () => {
      if (!resolved) reject(new Error("No voice command detected. Please try again."));
    };

    recognition.start();
  });
}

export async function captureSpeechFromNative(language = "en-IN"): Promise<SpeechCaptureResult> {
  if (Platform.OS === "web") return captureSpeechFromBrowser(language);

  const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  if (!permissions.granted) {
    throw new Error("Microphone permission is required for Voice AI. Enable it in Android Settings.");
  }

  if (!supportsNativeSpeechRecognition()) {
    throw new Error("Android speech recognition service is unavailable. Enable Google Speech Recognition & Synthesis.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let latestTranscript = "";

    const cleanup = () => {
      resultSubscription.remove();
      errorSubscription.remove();
      endSubscription.remove();
    };

    const finishResolve = (transcript: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ transcript: transcript.trim(), provider: "native" });
    };

    const finishReject = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    const resultSubscription = ExpoSpeechRecognitionModule.addListener(
      "result",
      (event: ExpoSpeechRecognitionResultEvent) => {
        const transcript = String(event.results?.[0]?.transcript || "").trim();
        if (transcript) latestTranscript = transcript;
        if (event.isFinal && latestTranscript) finishResolve(latestTranscript);
      }
    );

    const errorSubscription = ExpoSpeechRecognitionModule.addListener(
      "error",
      (event: ExpoSpeechRecognitionErrorEvent) => {
        if (event.error === "aborted") return;
        const friendly =
          event.error === "not-allowed"
            ? "Microphone permission was denied. Enable it in Android Settings."
            : event.error === "speech-timeout" || event.error === "no-speech"
              ? "No speech detected. Tap the mic and speak again."
              : event.message || "Voice recognition failed. Please try again.";
        finishReject(friendly);
      }
    );

    const endSubscription = ExpoSpeechRecognitionModule.addListener("end", () => {
      if (latestTranscript) finishResolve(latestTranscript);
      else finishReject("No voice command detected. Please try again.");
    });

    try {
      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        contextualStrings: ["Viora", "hydration", "wellness", "yoga", "sleep", "nutrition"],
      });
    } catch (error: any) {
      finishReject(error?.message || "Unable to start Android voice recognition.");
    }
  });
}

export function captureSpeech(language = "en-IN") {
  return Platform.OS === "web"
    ? captureSpeechFromBrowser(language)
    : captureSpeechFromNative(language);
}
