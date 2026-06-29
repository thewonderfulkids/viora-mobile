import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppCard, Screen, SectionHeader } from "../../components/common";
import { colors, spacing, typography } from "../../theme";

const wellnessModules = [
  {
    icon: "💧",
    title: "Hydration",
    text: "Track your daily water intake and hydration goal.",
    route: "/hydration",
    status: "Available",
  },
  {
    icon: "😴",
    title: "Sleep",
    text: "Log your sleep duration and quality.",
    route: "/sleep",
    status: "Available",
  },
  {
    icon: "🧘",
    title: "Yoga",
    text: "Start short guided movement sessions.",
    route: "/yoga",
    status: "Available",
  },
  {
    icon: "🤖",
    title: "AI Coach",
    text: "Get personalized wellness guidance from Viora AI.",
    route: "/ai-coach",
    status: "Available",
  },
  {
    icon: "🧠",
    title: "AI Wellness Intelligence",
    text: "View your daily wellness index, trend detection and personalized AI recommendations.",
    route: "/wellness-intelligence",
    status: "Available",
  },
  {
    icon: "🎯",
    title: "Goals & Habits",
    text: "Create smart goals, complete habits and track streak-powered wellness progress.",
    route: "/goals-habits",
    status: "Available",
  },
  {
    icon: "🎵",
    title: "Music Therapy",
    text: "Relax with calming sound therapy sessions.",
    route: "/music",
    status: "Beta",
  },
  {
    icon: "😌",
    title: "Meditation",
    text: "Guided breathing and calming sessions are coming soon.",
    route: null,
    status: "Coming Soon",
  },
  {
    icon: "🍎",
    title: "Nutrition Intelligence",
    text: "Log meals, understand macros and get AI nutrition guidance.",
    route: "/nutrition",
    status: "Available",
  },
  {
    icon: "⌚",
    title: "Wearables",
    text: "Connect smart watches and health devices.",
    route: null,
    status: "Coming Soon",
  },
];

export default function WellnessScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          label="Wellness Hub"
          title="Your Daily Wellness Tools"
          subtitle="Choose what you want to improve today. Viora will connect your activity with AI insights."
        />

        <View style={styles.grid}>
          {wellnessModules.map((item) => (
            <Pressable
              key={item.title}
              disabled={!item.route}
              onPress={
                item.route ? () => router.push(item.route as any) : undefined
              }
            >
              <AppCard>
                <View style={styles.cardHeader}>
                  <Text style={styles.icon}>{item.icon}</Text>
                  <View
                    style={[
                      styles.badge,
                      item.status === "Coming Soon" && styles.comingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.status === "Coming Soon" && styles.comingBadgeText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardText}>{item.text}</Text>
              </AppCard>
            </Pressable>
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
  grid: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: 34,
  },
  badge: {
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  comingBadge: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  comingBadgeText: {
    color: colors.mutedText,
  },
  cardTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  cardText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});