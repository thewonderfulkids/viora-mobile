import { VoiceIntent, VoiceLanguage, VoiceNavigationTarget } from "../../types";

function normalizeTranscript(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function detectLanguage(transcript: string): VoiceLanguage {
  const value = normalizeTranscript(transcript);
  const hindiWords = ["paani", "khana", "dikhao", "kholo", "mood", "neend", "report", "kitna", "kya"];

  if (/[\u0900-\u097F]/.test(transcript)) return "hi";
  if (hindiWords.some((word) => value.includes(word))) return "hinglish";
  return "en";
}

function detectRoute(value: string): VoiceNavigationTarget | null {
  const routes: Array<{ route: VoiceNavigationTarget; keywords: string[] }> = [
    { route: "/reports", keywords: ["report", "reports", "weekly report", "monthly report", "health report"] },
    { route: "/nutrition", keywords: ["nutrition", "food", "meal", "breakfast", "lunch", "dinner", "khana"] },
    { route: "/hydration", keywords: ["hydration", "water", "paani"] },
    { route: "/mental-wellness", keywords: ["mood", "stress", "mental", "feeling"] },
    { route: "/sleep", keywords: ["sleep", "neend"] },
    { route: "/goals-habits", keywords: ["goal", "habit", "streak"] },
    { route: "/wellness-intelligence", keywords: ["wellness score", "intelligence", "insights"] },
    { route: "/smart-notifications", keywords: ["reminder", "notification", "nudge"] },
    { route: "/ai-coach", keywords: ["coach", "ask ai", "ai coach"] },
    { route: "/premium", keywords: ["premium", "subscription", "plan"] },
    { route: "/settings-center", keywords: ["settings", "setting"] },
    { route: "/dashboard", keywords: ["dashboard", "home"] },
  ];

  return routes.find((item) => item.keywords.some((keyword) => value.includes(keyword)))?.route || null;
}

function extractAmountMl(value: string) {
  const mlMatch = value.match(/(\d{2,4})\s*(ml|millilitre|milliliter|milli|एमएल)/i);
  if (mlMatch?.[1]) return Number(mlMatch[1]);

  const glassMatch = value.match(/(\d{1,2})\s*(glass|glasses|गिलास)/i);
  if (glassMatch?.[1]) return Number(glassMatch[1]) * 250;

  if (value.includes("one glass") || value.includes("ek glass") || value.includes("एक गिलास")) return 250;
  return undefined;
}

function containsAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

export function parseVoiceIntent(transcript: string): VoiceIntent {
  const value = normalizeTranscript(transcript);
  const language = detectLanguage(transcript);
  const amountMl = extractAmountMl(value);

  if (!value) {
    return { type: "unknown", confidence: 0, language, entities: {} };
  }

  if (amountMl && containsAny(value, ["water", "paani", "hydration", "ml", "glass"])) {
    return {
      type: "log_hydration",
      confidence: 0.92,
      language,
      amountMl,
      targetRoute: "/hydration",
      entities: { amountMl },
    };
  }

  if (containsAny(value, ["open", "show", "go to", "kholo", "dikhao", "ले चलो", "खोलो"])) {
    const targetRoute = detectRoute(value);
    if (targetRoute) {
      return {
        type: targetRoute === "/reports" ? "read_report" : "navigation",
        confidence: 0.88,
        language,
        targetRoute,
        entities: { targetRoute },
      };
    }
  }

  if (containsAny(value, ["ate", "had", "breakfast", "lunch", "dinner", "snack", "tea", "roti", "dal", "khaya", "piya"])) {
    return {
      type: "log_nutrition",
      confidence: 0.78,
      language,
      targetRoute: "/nutrition",
      mealText: transcript,
      entities: { mealText: transcript },
    };
  }

  if (containsAny(value, ["mood", "stress", "happy", "sad", "anxious", "angry", "tired", "stressed", "feel", "feeling"])) {
    return {
      type: "log_mood",
      confidence: 0.76,
      language,
      targetRoute: "/mental-wellness",
      moodText: transcript,
      entities: { moodText: transcript },
    };
  }

  if (containsAny(value, ["sleep", "slept", "bed", "neend", "soya", "soyi"])) {
    return {
      type: "log_sleep",
      confidence: 0.74,
      language,
      targetRoute: "/sleep",
      sleepText: transcript,
      entities: { sleepText: transcript },
    };
  }

  if (containsAny(value, ["goal", "habit", "target", "streak", "challenge"])) {
    return {
      type: "create_goal",
      confidence: 0.72,
      language,
      targetRoute: "/goals-habits",
      goalText: transcript,
      entities: { goalText: transcript },
    };
  }

  const targetRoute = detectRoute(value);
  if (targetRoute) {
    return {
      type: targetRoute === "/reports" ? "read_report" : "navigation",
      confidence: 0.7,
      language,
      targetRoute,
      entities: { targetRoute },
    };
  }

  return {
    type: "coach_question",
    confidence: 0.62,
    language,
    targetRoute: "/ai-coach",
    question: transcript,
    entities: { question: transcript },
  };
}
