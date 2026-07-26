import { router } from "expo-router";
import { BarChart3, Bell, ChevronRight, FileText, LineChart, Sparkles, Target, TrendingUp } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PremiumTabHero } from "../../components/premiumExperience";
import { colors, radius, spacing } from "../../theme";

type ProgressAction = {
  icon: typeof LineChart;
  title: string;
  text: string;
  route: string;
  badge: string;
  tint: string;
  background: string;
};

const progressActions: ProgressAction[] = [
  { icon: LineChart, title: "Wellness Trends", text: "Review hydration, sleep, nutrition, mood and wellness patterns.", route: "/reports", badge: "Reports", tint: "#176B87", background: "#E5F6FB" },
  { icon: BarChart3, title: "Habit Analytics", text: "See consistency, active goals, streaks and improvement patterns.", route: "/goals-habits", badge: "Habits", tint: "#7A5310", background: "#FFF4D8" },
  { icon: Sparkles, title: "AI Progress Insights", text: "Understand what improved and what routine deserves focus next.", route: "/wellness-intelligence", badge: "AI", tint: "#6546B8", background: "#F0EBFF" },
  { icon: FileText, title: "Export Wellness Reports", text: "Prepare daily, weekly and monthly wellness summaries.", route: "/reports", badge: "Export", tint: "#A64052", background: "#FFECEF" },
  { icon: Bell, title: "Smart Reminders", text: "Manage reminders shaped around your routine and goals.", route: "/smart-notifications", badge: "Routine", tint: "#14705D", background: "#E5F7F1" },
];

export default function ProgressScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PremiumTabHero
          eyebrow="Progress that feels understandable"
          title="See the story behind your wellness data."
          subtitle="Track patterns, celebrate consistency and turn everyday activity into a clearer next step."
          icon={TrendingUp}
          colors={["#063F38", "#087361", "#17A17F"]}
        >
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>5</Text>
              <Text style={styles.heroStatLabel}>connected areas</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>AI</Text>
              <Text style={styles.heroStatLabel}>guided insights</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>PDF</Text>
              <Text style={styles.heroStatLabel}>ready reports</Text>
            </View>
          </View>
        </PremiumTabHero>

        <Pressable style={styles.featuredCard} onPress={() => router.push("/wellness-intelligence" as never)}>
          <View style={styles.featuredIcon}><Target size={24} color="#FFFFFF" /></View>
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredEyebrow}>Recommended next</Text>
            <Text style={styles.featuredTitle}>Open your AI progress review</Text>
            <Text style={styles.featuredText}>Let Viora connect your latest wellness signals into one practical focus.</Text>
          </View>
          <ChevronRight size={20} color="#FFFFFF" />
        </Pressable>

        <View>
          <Text style={styles.sectionEyebrow}>Your progress center</Text>
          <Text style={styles.sectionTitle}>Everything that moves you forward</Text>
        </View>

        <View style={styles.featureList}>
          {progressActions.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable key={item.title} style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]} onPress={() => router.push(item.route as never)}>
                <View style={[styles.featureIcon, { backgroundColor: item.background }]}><Icon size={22} color={item.tint} /></View>
                <View style={styles.featureCopy}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <View style={[styles.badge, { backgroundColor: item.background }]}><Text style={[styles.badgeText, { color: item.tint }]}>{item.badge}</Text></View>
                  </View>
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
                <ChevronRight size={19} color="#85938B" />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: 42, paddingBottom: 140, gap: spacing.xl },
  heroStats: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: radius.xl, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  heroStat: { flex: 1, alignItems: "center", gap: 2 },
  heroStatValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  heroStatLabel: { color: "rgba(255,255,255,0.70)", fontSize: 9.5, fontWeight: "800" },
  heroDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.20)" },
  featuredCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.primaryDark, borderRadius: radius.xl, padding: spacing.lg },
  featuredIcon: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  featuredCopy: { flex: 1, gap: 3 },
  featuredEyebrow: { color: colors.mint, fontSize: 10, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  featuredTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  featuredText: { color: "rgba(255,255,255,0.70)", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  sectionEyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  sectionTitle: { color: colors.text, fontSize: 23, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },
  featureList: { gap: spacing.md },
  featureCard: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, flexDirection: "row", gap: spacing.md, alignItems: "center" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  featureIcon: { width: 50, height: 50, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  featureCopy: { flex: 1, gap: 6 },
  featureTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  featureTitle: { flex: 1, color: colors.text, fontSize: 15.5, fontWeight: "900" },
  featureText: { color: colors.mutedText, fontSize: 12.5, lineHeight: 18, fontWeight: "600" },
  badge: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 9.5, fontWeight: "900", textTransform: "uppercase" },
});
