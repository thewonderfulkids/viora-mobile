import { LinearGradient } from "expo-linear-gradient";
import { Mic, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { VoiceProviderStatus } from "../../types";

type Props = {
  status: VoiceProviderStatus;
  providerLabel: string;
  aiCoachContext: string;
};

function statusLabel(status: VoiceProviderStatus) {
  if (status === "listening") return "Listening";
  if (status === "processing") return "Processing";
  if (status === "speaking") return "Speaking";
  if (status === "unsupported") return "Manual Mode";
  if (status === "error") return "Needs Attention";
  return "Ready";
}

export function VoiceAIHero({ status, providerLabel, aiCoachContext }: Props) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconShell}>
          <Mic size={26} color={colors.white} />
        </View>

        <View style={styles.statusPill}>
          <Sparkles size={14} color={colors.primaryDark} />
          <Text style={styles.statusText}>{statusLabel(status)}</Text>
        </View>
      </View>

      <Text style={styles.kicker}>Sprint 21</Text>
      <Text style={styles.title}>Voice AI Foundation</Text>
      <Text style={styles.subtitle}>
        Speak naturally to open modules, log hydration, ask AI Coach and prepare safe confirmation flows for food, mood, sleep and goals.
      </Text>

      <View style={styles.providerBox}>
        <Text style={styles.providerLabel}>Provider</Text>
        <Text style={styles.providerValue}>{providerLabel}</Text>
        <Text style={styles.context}>{aiCoachContext}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconShell: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: colors.mint,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.softGreen,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  providerBox: {
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: spacing.lg,
  },
  providerLabel: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  providerValue: {
    marginTop: 4,
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  context: {
    marginTop: spacing.xs,
    color: colors.softGreen,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
