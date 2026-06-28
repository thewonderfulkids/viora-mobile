import { LinearGradient } from "expo-linear-gradient";
import { Activity, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../theme";

type WellnessScoreCardProps = {
  score: number;
};

export default function WellnessScoreCard({ score }: WellnessScoreCardProps) {
  const message =
    score >= 75
      ? "Great rhythm today. Keep your streak alive."
      : score >= 50
      ? "Good start. A few small actions can lift your day."
      : "Start simple today. Water, movement and calm breathing.";

  const progress = Math.max(0, Math.min(score, 100));

  return (
    <LinearGradient
      colors={["#0B6E4F", "#12845F", "#1BAE7A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Activity size={22} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Today's Wellness Score</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <Sparkles size={22} color="#EAF7EF" />
      </View>

      <View style={styles.scoreArea}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Text style={styles.score}>{progress}</Text>
            <Text style={styles.outOf}>/100</Text>
          </View>
        </View>

        <View style={styles.scoreTextWrap}>
          <Text style={styles.scoreTitle}>Balanced Progress</Text>
          <Text style={styles.scoreText}>
            Your score updates as hydration, sleep, yoga and relaxation improve.
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    padding: 24,
    gap: spacing.lg,
    overflow: "hidden",
  },
  glowOne: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    top: -60,
    right: -40,
  },
  glowTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    bottom: -60,
    left: -30,
  },
  topRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#EAF7EF",
    fontSize: 15,
    fontWeight: "900",
  },
  message: {
    marginTop: 4,
    color: "#DFF7EA",
    ...typography.caption,
    fontWeight: "700",
  },
  scoreArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  ringOuter: {
    width: 118,
    height: 118,
    borderRadius: 999,
    borderWidth: 9,
    borderColor: "rgba(255,255,255,0.32)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  ringInner: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    color: colors.white,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },
  outOf: {
    color: "#DFF7EA",
    fontSize: 13,
    fontWeight: "900",
  },
  scoreTextWrap: {
    flex: 1,
  },
  scoreTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
  },
  scoreText: {
    marginTop: 8,
    color: "#EAF7EF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
});