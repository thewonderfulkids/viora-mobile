import { router } from "expo-router";
import { BarChart3, Bell, FileText, LineChart, Sparkles } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen, SectionHeader } from "../../components/common";
import { colors, radius, spacing } from "../../theme";

const upcomingFeatures = [
  {
    icon: LineChart,
    title: "Weekly Wellness Trends",
    text: "See hydration, sleep, yoga and AI activity trends across the week.",
  },
  {
    icon: BarChart3,
    title: "Habit Analytics",
    text: "Understand consistency, streaks, improvements and risk patterns.",
  },
  {
    icon: Sparkles,
    title: "AI Progress Insights",
    text: "Viora will explain what improved and what needs attention.",
  },
  {
    icon: FileText,
    title: "Weekly Reports",
    text: "Generate shareable wellness summaries and future PDF reports.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    text: "Personalized reminders based on your actual wellness behavior.",
  },
];

export default function ProgressScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          label="Progress Center"
          title="Wellness Analytics Coming Soon"
          subtitle="We are preparing real historical analytics powered by your activity and AI memory."
        />

        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>📈</Text>
          <Text style={styles.heroTitle}>Progress will be real, not dummy.</Text>
          <Text style={styles.heroText}>
            This section will unlock once Viora has enough activity history to
            calculate accurate trends, streaks and AI recommendations.
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)" as any)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Coming Features</Text>

        <View style={styles.featureList}>
          {upcomingFeatures.map((item) => {
            const Icon = item.icon;

            return (
              <View key={item.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon size={22} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
              </View>
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
    paddingTop: 64,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },
  heroIcon: {
    fontSize: 52,
  },
  heroTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  heroText: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
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
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  featureText: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
});