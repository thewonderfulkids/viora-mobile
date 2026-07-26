import { router } from "expo-router";
import {
  BrainCircuit,
  ChevronRight,
  HeartPulse,
  MessageCircleMore,
  Mic2,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PremiumTabHero } from "../../components/premiumExperience";
import { colors, radius, spacing } from "../../theme";

type AIAction = {
  title: string;
  subtitle: string;
  route: string;
  icon: typeof Sparkles;
  tint: string;
  background: string;
  badge: string;
};

const aiActions: AIAction[] = [
  {
    title: "AI Wellness Coach",
    subtitle: "Ask questions and receive personalized guidance from your current wellness context.",
    route: "/ai-coach",
    icon: MessageCircleMore,
    tint: "#5B4FD6",
    background: "#EFEDFF",
    badge: "Chat",
  },
  {
    title: "Voice Companion",
    subtitle: "Speak naturally to Viora for quick wellness help, logging and daily guidance.",
    route: "/voice-ai",
    icon: Mic2,
    tint: "#0B7F77",
    background: "#E3F8F5",
    badge: "Voice",
  },
  {
    title: "AI Memory",
    subtitle: "Review what Viora remembers about your routines, preferences and wellness journey.",
    route: "/ai-memory",
    icon: BrainCircuit,
    tint: "#A94F13",
    background: "#FFF0E5",
    badge: "Memory",
  },
  {
    title: "Wellness Intelligence",
    subtitle: "Understand trends, risks and the next best action from your connected wellness data.",
    route: "/wellness-intelligence",
    icon: HeartPulse,
    tint: "#B23055",
    background: "#FFEAF0",
    badge: "Insights",
  },
];

export default function AITabScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PremiumTabHero
          eyebrow="Your personal wellness intelligence"
          title="One AI companion for your whole routine."
          subtitle="Talk, ask, reflect and understand your wellness without jumping between disconnected tools."
          icon={Sparkles}
          colors={["#21194A", "#5742A8", "#8B63D9"]}
        >
          <Pressable style={styles.heroButton} onPress={() => router.push("/ai-coach" as never)}>
            <MessageCircleMore size={18} color="#35256F" />
            <Text style={styles.heroButtonText}>Start a conversation</Text>
            <ChevronRight size={17} color="#35256F" />
          </Pressable>
        </PremiumTabHero>

        <View style={styles.trustStrip}>
          <View style={styles.trustIcon}>
            <ShieldCheck size={20} color={colors.primary} />
          </View>
          <View style={styles.trustCopy}>
            <Text style={styles.trustTitle}>Personalized, not generic</Text>
            <Text style={styles.trustText}>Guidance can use your Viora activity, goals and saved wellness context.</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>AI capabilities</Text>
            <Text style={styles.sectionTitle}>Choose how Viora helps</Text>
          </View>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Ready</Text>
          </View>
        </View>

        <View style={styles.actionList}>
          {aiActions.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.title}
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.background }]}>
                  <Icon size={23} color={item.tint} />
                </View>
                <View style={styles.actionCopy}>
                  <View style={styles.actionTitleRow}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <View style={[styles.badge, { backgroundColor: item.background }]}>
                      <Text style={[styles.badgeText, { color: item.tint }]}>{item.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={19} color="#839188" />
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
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  heroButtonText: { color: "#35256F", fontSize: 14, fontWeight: "900" },
  trustStrip: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  trustIcon: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.softGreen },
  trustCopy: { flex: 1, gap: 3 },
  trustTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  trustText: { color: colors.mutedText, fontSize: 12.5, lineHeight: 18, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionEyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  sectionTitle: { color: colors.text, fontSize: 23, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },
  activePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.softGreen, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  activeText: { color: colors.primaryDark, fontSize: 11, fontWeight: "900" },
  actionList: { gap: spacing.md },
  actionCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  actionIcon: { width: 50, height: 50, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actionCopy: { flex: 1, gap: 6 },
  actionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  actionTitle: { flex: 1, color: colors.text, fontSize: 15.5, fontWeight: "900" },
  actionSubtitle: { color: colors.mutedText, fontSize: 12.5, lineHeight: 18, fontWeight: "600" },
  badge: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 9.5, fontWeight: "900", textTransform: "uppercase" },
});
