import { Brain, ShieldAlert, Sparkles, Target } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { AICoachContextSnapshot } from "../../types/aiCoach";
import { colors, radius, spacing } from "../../theme";

type Props = {
  snapshot: AICoachContextSnapshot | null;
};

function formatFocus(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AIContextSnapshotCard({ snapshot }: Props) {
  if (!snapshot) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Brain size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Coach Context</Text>
          <Text style={styles.subtitle}>Personalized from memory and wellness intelligence</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.tile}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={styles.value}>{snapshot.dailyWellnessIndex}</Text>
          <Text style={styles.label}>Daily Index</Text>
        </View>

        <View style={styles.tile}>
          <Target size={16} color={colors.primary} />
          <Text style={styles.value}>{formatFocus(snapshot.primaryFocus)}</Text>
          <Text style={styles.label}>Focus</Text>
        </View>

        <View style={styles.tile}>
          <ShieldAlert size={16} color={colors.primary} />
          <Text style={styles.value}>{snapshot.riskLevel.toUpperCase()}</Text>
          <Text style={styles.label}>Risk</Text>
        </View>
      </View>

      <Text style={styles.summary}>{snapshot.summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: 4,
  },
  value: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  label: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  summary: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
