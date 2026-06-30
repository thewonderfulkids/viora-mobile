import { router } from "expo-router";
import { BarChart3, Bell, ChevronRight, FileText, LineChart, Sparkles, Target } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommonBackButton, Screen, SectionHeader } from "../../components/common";
import { colors, radius, spacing } from "../../theme";

type ProgressAction = {
  icon: typeof LineChart;
  title: string;
  text: string;
  route: string;
  badge: string;
};

const progressActions: ProgressAction[] = [
  {
    icon: LineChart,
    title: "Weekly Wellness Trends",
    text: "Open your AI report center to review hydration, sleep, nutrition, mood and wellness trends.",
    route: "/reports",
    badge: "Reports",
  },
  {
    icon: BarChart3,
    title: "Habit Analytics",
    text: "Review active goals, habit consistency, streaks, suggestions and improvement patterns.",
    route: "/goals-habits",
    badge: "Habits",
  },
  {
    icon: Sparkles,
    title: "AI Progress Insights",
    text: "Let Viora explain what improved, what needs attention and which routine to focus on next.",
    route: "/wellness-intelligence",
    badge: "AI",
  },
  {
    icon: FileText,
    title: "Weekly Reports",
    text: "Generate PDF-ready daily, weekly and monthly wellness reports from your latest data.",
    route: "/reports",
    badge: "Export",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    text: "Manage personalized reminders powered by your habits, AI memory and wellness routine.",
    route: "/smart-notifications",
    badge: "Reminders",
  },
];

function openRoute(route: string) {
  router.push({ pathname: route as never });
}

export default function ProgressScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <CommonBackButton label="Home" />

        <SectionHeader
          label="Progress Center"
          title="Your wellness progress hub"
          subtitle="Jump into real analytics, AI insights, reports, goals and reminders connected to your Viora data."
        />

        <View style={styles.heroCard}>
          <View style={styles.heroIconShell}>
            <Target size={30} color={colors.white} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Sprint 20 Connected</Text>
            <Text style={styles.heroTitle}>Reports, habits and AI insights are now one tap away.</Text>
            <Text style={styles.heroText}>
              This page now routes to working Viora modules instead of inactive placeholder cards.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Progress Actions</Text>

        <View style={styles.featureList}>
          {progressActions.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.title}
                style={({ pressed }) => [styles.featureCard, pressed ? styles.featureCardPressed : null]}
                onPress={() => openRoute(item.route)}
              >
                <View style={styles.featureIcon}>
                  <Icon size={22} color={colors.primary} />
                </View>

                <View style={styles.featureCopy}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>

                <View style={styles.chevronShell}>
                  <ChevronRight size={18} color={colors.primaryDark} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 40,
    gap: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  heroIconShell: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroKicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  heroText: {
    color: colors.softGreen,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  featureList: {
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  featureCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  featureCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  featureTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  featureText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  chevronShell: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
