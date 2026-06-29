import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { AIMemoryStat } from "../../types/aiMemory";

type AIMemoryStatGridProps = {
  stats: AIMemoryStat[];
};

export function AIMemoryStatGrid({ stats }: AIMemoryStatGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.card}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.helper}>{stat.helper}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47.5%",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  value: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  label: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  helper: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
});
