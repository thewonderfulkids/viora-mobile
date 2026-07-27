import { PremiumReminderCategory } from "./types";

const COPY: Record<PremiumReminderCategory, string[]> = {
  hydration: [
    "A glass of water now can help your focus feel lighter.",
    "Small sip, steady energy. Time to hydrate.",
    "Your body works better when hydration stays consistent.",
  ],
  meditation: [
    "Take two quiet minutes. Your nervous system will notice.",
    "Pause, breathe slowly, and give your mind some room.",
    "A calmer next hour can begin with one mindful minute.",
  ],
  sleep: [
    "Your tomorrow starts with how gently you wind down tonight.",
    "Dim the lights, slow the pace, and prepare for deeper rest.",
    "A consistent sleep routine is one of your strongest wellness habits.",
  ],
  workout: [
    "A short workout still counts. Start with five minutes.",
    "Move a little now and let momentum do the rest.",
    "Your body does not need perfection—just a little movement.",
  ],
  steps: [
    "A short walk can lift both your step count and your mood.",
    "You are closer to today’s movement goal than you think.",
    "Take the longer route for the next few minutes.",
  ],
  habit: [
    "One small habit completed today is progress you can keep.",
    "Consistency wins quietly. Check in with your goal.",
    "Your next healthy choice can be very small.",
  ],
  morning: [
    "Good morning. Start gently and choose one realistic wellness goal.",
    "A fresh day does not need a perfect plan—just a clear first step.",
    "Begin with water, light movement, and one kind thought.",
  ],
  night: [
    "Before you sleep, notice one thing you did well today.",
    "Slow down. Your day is allowed to end without being perfect.",
    "A short reflection now can make tomorrow feel clearer.",
  ],
};

export function getRotatingReminderBody(
  category: PremiumReminderCategory,
  seed = Date.now(),
) {
  const options = COPY[category];
  return options[Math.abs(seed) % options.length];
}
