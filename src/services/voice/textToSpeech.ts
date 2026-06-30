export function supportsBrowserTextToSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(text: string, language = "en-IN") {
  if (!text || !supportsBrowserTextToSpeech()) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (!supportsBrowserTextToSpeech()) return;
  window.speechSynthesis.cancel();
}
