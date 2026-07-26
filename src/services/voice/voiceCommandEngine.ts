import { addWaterLog } from "../hydrationService";
import { saveVoiceCommand } from "../../repositories";
import { VoiceCommandRecord, VoiceCommandResult, VoiceIntent } from "../../types";
import { parseVoiceIntent } from "./voiceIntentParser";

function nowIso() {
  return new Date().toISOString();
}

function responseForIntent(intent: VoiceIntent) {
  switch (intent.type) {
    case "log_hydration":
      return {
        title: "Hydration logged",
        message: `${intent.amountMl || 0} ml water has been added to today's hydration.` ,
        spokenResponse: `Done. I added ${intent.amountMl || 0} ml water to your hydration.`,
      };
    case "log_nutrition":
      return {
        title: "Nutrition command captured",
        message: "I opened Nutrition so you can confirm calories and portions before saving.",
        spokenResponse: "I captured your meal. Please confirm the food items and portions in Nutrition.",
      };
    case "log_mood":
      return {
        title: "Mood command captured",
        message: "I opened Mental Wellness so you can confirm mood level, stress and triggers.",
        spokenResponse: "I captured your mood note. Please confirm it in Mental Wellness.",
      };
    case "log_sleep":
      return {
        title: "Sleep command captured",
        message: "I opened Sleep so you can confirm sleep duration and quality.",
        spokenResponse: "I can help log sleep. Please confirm the details on the Sleep screen.",
      };
    case "create_goal":
      return {
        title: "Goal command captured",
        message: "I opened Goals & Habits so you can confirm the new goal or habit.",
        spokenResponse: "I captured your goal idea. Please confirm it in Goals and Habits.",
      };
    case "read_report":
      return {
        title: "Opening reports",
        message: "Your Health Reports are ready to view.",
        spokenResponse: "Opening your health reports.",
      };
    case "navigation":
      return {
        title: "Opening screen",
        message: "Taking you to the requested Viora screen.",
        spokenResponse: "Opening it now.",
      };
    case "coach_question":
      return {
        title: "AI Coach question captured",
        message: "I saved this as a coaching question. Open AI Coach when you want a full contextual answer.",
        spokenResponse: "I saved this coaching question. You can continue it in AI Coach.",
      };
    default:
      return {
        title: "Voice command saved",
        message: "I saved this command. Try asking Viora to open a module, log water or show reports.",
        spokenResponse: "I saved that command, but I need a little more detail to act on it.",
      };
  }
}

export async function processVoiceCommand(input: {
  userId: string;
  transcript: string;
  provider: "browser" | "native" | "manual" | "mock";
}): Promise<VoiceCommandResult> {
  if (!input.userId) throw new Error("Please login again.");
  if (!input.transcript.trim()) throw new Error("Please say or type a voice command.");

  const intent = parseVoiceIntent(input.transcript);
  let status: VoiceCommandRecord["status"] = "ready";

  if (intent.type === "log_hydration" && intent.amountMl) {
    await addWaterLog({ uid: input.userId, amountMl: intent.amountMl, source: "voice" as any });
    status = "completed";
  } else if (["log_nutrition", "log_mood", "log_sleep", "create_goal"].includes(intent.type)) {
    status = "needs_confirmation";
  }

  const copy = responseForIntent(intent);
  const saved = await saveVoiceCommand({
    userId: input.userId,
    transcript: input.transcript.trim(),
    rawTranscript: input.transcript.trim(),
    provider: input.provider,
    intent,
    status,
    title: copy.title,
    message: copy.message,
    spokenResponse: copy.spokenResponse,
    targetRoute: intent.targetRoute,
  });

  return {
    id: saved.id,
    transcript: saved.transcript,
    intent: saved.intent,
    status: saved.status,
    title: saved.title,
    message: saved.message,
    spokenResponse: saved.spokenResponse,
    targetRoute: saved.targetRoute,
    createdAt: saved.createdAt || nowIso(),
  };
}
