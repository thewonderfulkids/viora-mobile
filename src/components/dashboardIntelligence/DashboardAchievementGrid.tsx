import { Award } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { DashboardAchievement } from "../../types/dashboardIntelligence";
import { colors, radius, spacing } from "../../theme";

export function DashboardAchievementGrid({ achievements }: { achievements: DashboardAchievement[] }) {
  return (
    <View style={styles.grid}>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.card}>
          <View style={styles.iconBox}>
            <Award size={18} color={colors.primary} />
          </View>
          <Text style={styles.value}>{achievement.value}</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
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
    minWidth: 150,
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
});
