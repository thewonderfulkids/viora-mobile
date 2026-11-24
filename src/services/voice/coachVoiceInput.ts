type CoachVoiceRoute = "/dashboard" | "/steps" | "/nutrition" | "/premium" | "/reports" | "/settings-center";

const destinations: ReadonlyArray<readonly [RegExp, CoachVoiceRoute]> = [
  [/^(?:home|dashboard|होम|डैशबोर्ड)$/, "/dashboard"],
  [/^(?:steps|step counter|स्टेप्स|कदम)$/, "/steps"],
  [/^(?:nutrition|nutrition screen|न्यूट्रिशन|पोषण)$/, "/nutrition"],
  [/^(?:premium|membership|subscription|मेंबरशिप|प्रीमियम)$/, "/premium"],
  [/^(?:reports|रिपोर्ट्स|रिपोर्ट)$/, "/reports"],
  [/^(?:settings|सेटिंग्स)$/, "/settings-center"],
];

export async function submitCoachVoiceInput(
  transcript: string,
  actions: { ask: (prompt: string) => Promise<unknown>; navigate: (route: CoachVoiceRoute) => void }
) {
  const prompt = transcript.trim();
  if (!prompt) return;

  // Match the entire command, not a keyword embedded in a question or plan.
  const normalized = prompt.toLowerCase().replace(/\s+/g, " ").replace(/[.!।]+$/u, "");
  const target = normalized.match(/^(?:please )?(?:open|go to) (?:the )?(.+?)(?: please)?$/u)?.[1]
    ?? normalized.match(/^(.+?) (?:kholo|khol do|खोलो|खोल दो)$/u)?.[1];
  const route = target && destinations.find(([name]) => name.test(target))?.[1];
  if (route) {
    actions.navigate(route);
    return;
  }

  await actions.ask(prompt);
}
