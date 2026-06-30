import { router } from "expo-router";
import { BarChart3, Bell, Bot, Droplets, Dumbbell, HeartPulse, Salad, Users } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardSmartAction, DashboardSmartActionKind } from "../../types/dashboardIntelligence";
import { colors, radius, spacing } from "../../theme";

const iconMap = {
  hydration: Droplets,
  nutrition: Salad,
  aiCoach: Bot,
  reports: BarChart3,
  goals: Dumbbell,
  mood: HeartPulse,
  family: Users,
  notifications: Bell,
} satisfies Record<DashboardSmartActionKind, typeof Droplets>;

function badgeColor(priority: DashboardSmartAction["priority"]) {
  if (priority === "high") return colors.danger;
  if (priority === "medium") return colors.warning;
  return colors.primary;
}

export function DashboardSmartActionGrid({ actions }: { actions: DashboardSmartAction[] }) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => {
        const Icon = iconMap[action.kind];
        return (
          <Pressable
            key={action.id}
            style={styles.card}
            onPress={() => router.push({ pathname: action.route as never })}
          >
            <View style={styles.iconBox}>
              <Icon size={20} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{action.title}</Text>
              <Text style={styles.subtitle}>{action.subtitle}</Text>
            </View>
            <View style={[styles.priorityDot, { backgroundColor: badgeColor(action.priority) }]} />
          </Pressable>
        );
      })}
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
    minWidth: 155,
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    position: "relative",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  priorityDot: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    width: 9,
    height: 9,
    borderRadius: 999,
  },
});
