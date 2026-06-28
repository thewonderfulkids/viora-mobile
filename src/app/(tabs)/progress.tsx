import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard, Screen, SectionHeader } from "../../components/common";
import { colors, radius, spacing, typography } from "../../theme";

const metrics = [
  { label: "Streak", value: "5 days", icon: "🔥" },
  { label: "Water", value: "2.1 / 3L", icon: "💧" },
  { label: "Sleep", value: "6h 45m", icon: "😴" },
  { label: "Steps", value: "6,420", icon: "🚶" },
];

const achievements = [
  "Completed morning yoga",
  "Hit hydration goal 3 days in a row",
  "Took 2 office stretch breaks",
];

export default function ProgressScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          label="Progress"
          title="Your Wellness Growth"
          subtitle="Track your habits, streaks and daily improvements."
        />

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Weekly Wellness Score</Text>
          <Text style={styles.score}>82</Text>
          <Text style={styles.scoreHint}>+4 points from last week</Text>
        </View>

        <Text style={styles.sectionTitle}>Today’s Metrics</Text>

        <View style={styles.metricsGrid}>
          {metrics.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{item.icon}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>

        <View style={styles.achievements}>
          {achievements.map((item) => (
            <AppCard key={item}>
              <Text style={styles.achievementText}>✅ {item}</Text>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xxl,
    padding: spacing.xl,
  },
  scoreLabel: {
    color: "#DFF7EA",
    fontSize: 15,
    fontWeight: "800",
  },
  score: {
    marginTop: spacing.md,
    color: colors.white,
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: -2,
  },
  scoreHint: {
    color: "#EAF7EF",
    ...typography.caption,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    color: colors.text,
    ...typography.sectionTitle,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIcon: {
    fontSize: 28,
  },
  metricValue: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  metricLabel: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
  achievements: {
    gap: spacing.md,
  },
  achievementText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
});