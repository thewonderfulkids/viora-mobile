import { Linking, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Dumbbell, Flame, PlayCircle, Sparkles, Layers3 } from "lucide-react-native";
import { router } from "expo-router";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { PremiumJourneyHero } from "../components/premiumExperience";
import { useProgramContent } from "../hooks";
import { colors, radius, spacing } from "../theme";
import { AdminManagedContent } from "../types";

function ProgramCard({ item }: { item: AdminManagedContent }) {
  const icon = item.category === "home_workout" ? "💪" : item.category === "weight_loss" ? "⚖️" : item.category === "yoga" ? "🧘" : item.kind === "music" ? "🎵" : "✨";

  function handleOpen() {
    if (item.category === "home_workout" && !item.url) {
      router.push("/home-workout" as never);
      return;
    }
    if (item.url) Linking.openURL(item.url);
  }

  return (
    <Pressable onPress={handleOpen} style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
      <View style={styles.cardHeader}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={[styles.badge, item.isPremium ? styles.premiumBadge : null]}>
          <Text style={[styles.badgeText, item.isPremium ? styles.premiumBadgeText : null]}>{item.isPremium ? "Premium" : "Free"}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardText}>{item.subtitle}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{item.category.replace(/_/g, " ")}</Text>
        <Text style={styles.meta}>{item.level}</Text>
        <Text style={styles.meta}>{item.durationMinutes || 10} min</Text>
      </View>
      <View style={styles.playRow}>
        <PlayCircle size={18} color={colors.primary} />
        <Text style={styles.playText}>{item.url ? "Open content" : "Open module"}</Text>
      </View>
    </Pressable>
  );
}

export default function ProgramsScreen() {
  const { items, loading, refreshing, error, refresh } = useProgramContent("all");

  if (loading && !items.length) return <Screen><LoadingState message="Loading Viora programs..." /></Screen>;
  if (error && !items.length) return <Screen><ErrorState title="Programs unavailable" message={error} onRetry={refresh} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <CommonBackButton label="Wellness" fallbackPath="/(tabs)/wellness" />
        <PremiumJourneyHero
          eyebrow="Guided Programs"
          title="Structured journeys, not random workouts."
          subtitle="Choose yoga, home fitness, weight management and restorative programs designed to fit your current level and routine."
          icon={<Layers3 size={29} color="#C2410C" />}
          colors={["#7C2D12", "#C2410C", "#F97316"]}
          chips={["Yoga", "Home fitness", "Weight goals", "Guided content"]}
        />

        <View style={styles.grid}>
          {items.map((item) => <ProgramCard key={item.id} item={item} />)}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: 32, paddingBottom: 170, gap: spacing.xl },
  hero: { borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.softGreen, padding: spacing.xl },
  eyebrow: { color: colors.primaryDark, fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  title: { marginTop: spacing.xs, color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: "900" },
  subtitle: { marginTop: spacing.sm, color: colors.mutedText, fontSize: 14, lineHeight: 21, fontWeight: "700" },
  heroStats: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: radius.pill, backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  heroPillText: { color: colors.primaryDark, fontSize: 11, fontWeight: "900" },
  grid: { gap: spacing.md },
  card: { borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: spacing.xl, gap: spacing.sm },
  pressed: { opacity: 0.76 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  icon: { fontSize: 36 },
  badge: { borderRadius: radius.pill, backgroundColor: colors.softGreen, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  premiumBadge: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA" },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  premiumBadgeText: { color: "#C2410C" },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  cardText: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  meta: { borderRadius: radius.pill, backgroundColor: colors.background, color: colors.mutedText, fontSize: 11, fontWeight: "900", paddingHorizontal: spacing.sm, paddingVertical: 5, textTransform: "capitalize" },
  playRow: { marginTop: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  playText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
});
