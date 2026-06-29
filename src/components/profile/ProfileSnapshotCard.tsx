import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  score: number;
  goal: string;
  stress: string;
};

export function ProfileSnapshotCard({
  score,
  goal,
  stress,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wellness Snapshot</Text>

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.value}>{score}</Text>
          <Text style={styles.label}>Score</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.value}>{goal}</Text>
          <Text style={styles.label}>Goal</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.value}>{stress}</Text>
          <Text style={styles.label}>Stress</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  grid: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
  },
  item: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  label: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
  },
});