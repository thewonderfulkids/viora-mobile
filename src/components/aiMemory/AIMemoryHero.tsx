import { BrainCircuit } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

type AIMemoryHeroProps = {
  memoryCount: number;
  confidenceAverage: number;
  highPriorityCount: number;
};

function formatPercent(value: number) {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

export function AIMemoryHero({ memoryCount, confidenceAverage, highPriorityCount }: AIMemoryHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <BrainCircuit size={30} color={colors.white} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>Viora Intelligence</Text>
          <Text style={styles.title}>AI Memory Dashboard</Text>
        </View>
      </View>

      <Text style={styles.description}>
        A clean view of what Viora has learned from your habits, wellness patterns and AI conversations.
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{memoryCount}</Text>
          <Text style={styles.metricLabel}>Memories</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{formatPercent(confidenceAverage)}</Text>
          <Text style={styles.metricLabel}>Confidence</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{highPriorityCount}</Text>
          <Text style={styles.metricLabel}>Priority</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
  },
  eyebrow: {
    color: "#BFEBD8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    marginTop: 4,
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  description: {
    color: "#E8FFF4",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  metricValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  metricLabel: {
    marginTop: 3,
    color: "#BFEBD8",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
});
