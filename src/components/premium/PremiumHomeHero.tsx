import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowUpRight, Brain, Leaf, MoonStar, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardBriefing } from "../../types/dashboardIntelligence";
import { premiumPalette, premiumShadow } from "../../theme/premium";

function getDayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function PremiumHomeHero({
  briefing,
  wellnessScore,
}: {
  briefing: DashboardBriefing;
  wellnessScore: number;
}) {
  const score = Math.max(0, Math.min(100, wellnessScore));

  return (
    <LinearGradient
      colors={[premiumPalette.forest, premiumPalette.forestSoft, premiumPalette.emerald]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />
      <View style={styles.leafOne}><Leaf size={80} color="rgba(255,255,255,0.07)" /></View>
      <View style={styles.leafTwo}><Leaf size={54} color="rgba(215,245,139,0.13)" /></View>

      <View style={styles.topRow}>
        <View style={styles.brandPill}>
          <Sparkles size={14} color={premiumPalette.forest} />
          <Text style={styles.brandPillText}>VIORA DAILY</Text>
        </View>
        <Pressable style={styles.aiButton} onPress={() => router.push("/ai-coach")}>
          <Brain size={18} color={premiumPalette.white} />
        </Pressable>
      </View>

      <Text style={styles.greeting}>{getDayPart()}</Text>
      <Text style={styles.headline}>{briefing.headline}</Text>
      <Text style={styles.summary}>{briefing.summary}</Text>

      <View style={styles.scorePanel}>
        <View style={styles.scoreRing}>
          <View style={styles.scoreRingInner}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.scoreUnit}>/100</Text>
          </View>
        </View>

        <View style={styles.scoreCopy}>
          <View style={styles.scoreLabelRow}>
            <MoonStar size={15} color={premiumPalette.lime} />
            <Text style={styles.scoreLabel}>TODAY&apos;S WELLNESS</Text>
          </View>
          <Text style={styles.focus}>{briefing.focus}</Text>
          <Text style={styles.recommendation} numberOfLines={2}>{briefing.recommendation}</Text>
        </View>
      </View>

      <Pressable style={styles.primaryAction} onPress={() => router.push("/ai-coach")}>
        <Text style={styles.primaryActionText}>Open my daily guidance</Text>
        <ArrowUpRight size={18} color={premiumPalette.forest} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 34,
    padding: 22,
    overflow: "hidden",
    gap: 11,
    ...premiumShadow.hero,
  },
  orbLarge: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -105,
    top: -100,
  },
  orbSmall: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(215,245,139,0.09)",
    left: -70,
    bottom: 45,
  },
  leafOne: { position: "absolute", right: 14, top: 86, transform: [{ rotate: "-18deg" }] },
  leafTwo: { position: "absolute", left: 15, bottom: 14, transform: [{ rotate: "24deg" }] },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: premiumPalette.lime,
  },
  brandPillText: { color: premiumPalette.forest, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  greeting: { marginTop: 8, color: premiumPalette.mint, fontSize: 14, fontWeight: "800" },
  headline: { color: premiumPalette.white, fontSize: 31, lineHeight: 37, fontWeight: "900", letterSpacing: -0.8, maxWidth: 330 },
  summary: { color: "rgba(255,255,255,0.76)", fontSize: 14, lineHeight: 21, fontWeight: "600", maxWidth: 340 },
  scorePanel: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderRadius: 25,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  scoreRing: {
    width: 88,
    height: 88,
    borderRadius: 999,
    padding: 6,
    borderWidth: 7,
    borderColor: premiumPalette.lime,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  scoreRingInner: { flex: 1, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(3,31,23,0.30)" },
  score: { color: premiumPalette.white, fontSize: 29, lineHeight: 31, fontWeight: "900" },
  scoreUnit: { color: premiumPalette.mint, fontSize: 10, fontWeight: "900" },
  scoreCopy: { flex: 1, gap: 4 },
  scoreLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreLabel: { color: premiumPalette.lime, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  focus: { color: premiumPalette.white, fontSize: 18, fontWeight: "900" },
  recommendation: { color: "rgba(255,255,255,0.72)", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  primaryAction: {
    marginTop: 3,
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: premiumPalette.white,
  },
  primaryActionText: { color: premiumPalette.forest, fontSize: 14, fontWeight: "900" },
});
