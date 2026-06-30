export type SpeechCaptureResult = {
  transcript: string;
  provider: "browser" | "manual" | "mock";
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
  if (typeof window === "undefined") return false;
  const anyWindow = window as any;
  return Boolean(anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition);
}

export function captureSpeechFromBrowser(language = "en-IN"): Promise<SpeechCaptureResult> {
  if (!supportsBrowserSpeechRecognition()) {
    return Promise.reject(new Error("Speech recognition is not available on this device yet."));
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
      resolved = true;
      recognition.stop();
      resolve({ transcript, provider: "browser" });
    };

    recognition.onerror = (event: any) => {
      if (resolved) return;
      reject(new Error(event?.error || "Voice capture failed."));
    };

    recognition.onend = () => {
      if (!resolved) {
        reject(new Error("No voice command detected. Please try again."));
      }
    };

    recognition.start();
  });
}
