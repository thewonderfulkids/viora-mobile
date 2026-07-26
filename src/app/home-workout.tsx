import { LinearGradient } from "expo-linear-gradient";
import { Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Clock3, Dumbbell, Flame, PlayCircle, ShieldCheck, Star, Zap } from "lucide-react-native";
import { useMemo, useState } from "react";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { useProgramContent } from "../hooks";
import { colors, radius, spacing } from "../theme";
import { AdminManagedContent } from "../types";

type CategoryFilter = "all" | "beginner" | "intermediate" | "advanced" | "no_equipment" | "home_items";

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "no_equipment", label: "No Equipment" },
  { id: "home_items", label: "Home Items" },
];

function inferFilter(item: AdminManagedContent): CategoryFilter {
  const text = `${item.title} ${item.subtitle} ${item.equipment?.join(" ")}`.toLowerCase();
  if (text.includes("home item") || text.includes("backpack") || text.includes("chair") || text.includes("bottle")) return "home_items";
  if (text.includes("no equipment") || item.equipment?.some((entry) => entry.toLowerCase().includes("no equipment"))) return "no_equipment";
  if (item.level === "advanced") return "advanced";
  if (item.level === "intermediate") return "intermediate";
  return "beginner";
}

function openMedia(item: AdminManagedContent) {
  if (item.url) Linking.openURL(item.url);
}

function MediaVisual({ item }: { item: AdminManagedContent }) {
  if (item.thumbnailUrl) {
    return <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />;
  }

  return (
    <LinearGradient colors={["#E8F8EF", "#FFFFFF"]} style={styles.thumbnailFallback}>
      <Dumbbell size={30} color={colors.primary} />
      <Text style={styles.thumbnailText}>{item.url ? "Video Ready" : "Admin Link Ready"}</Text>
    </LinearGradient>
  );
}

function WorkoutCard({ item, featured = false }: { item: AdminManagedContent; featured?: boolean }) {
  const hasVideo = Boolean(item.url);
  const equipment = item.equipment?.length ? item.equipment.join(" • ") : "No equipment";
  const calories = item.caloriesEstimate ? `${item.caloriesEstimate} kcal` : "Smart routine";

  return (
    <Pressable
      onPress={() => openMedia(item)}
      disabled={!hasVideo}
      style={({ pressed }) => [styles.card, featured ? styles.featuredCard : null, pressed ? styles.pressed : null]}
    >
      <MediaVisual item={item} />

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}><Clock3 size={13} color={colors.primary} /><Text style={styles.metaText}>{item.durationMinutes || 15} min</Text></View>
          <View style={styles.metaPill}><Flame size={13} color={colors.primary} /><Text style={styles.metaText}>{calories}</Text></View>
          {item.isPremium ? <View style={styles.premiumPill}><Star size={12} color="#92400E" /><Text style={styles.premiumText}>Premium</Text></View> : null}
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Equipment</Text>
          <Text style={styles.infoText}>{equipment}</Text>
        </View>

        {item.benefits?.length ? (
          <View style={styles.chipWrap}>
            {item.benefits.slice(0, 4).map((benefit) => <Text key={benefit} style={styles.softChip}>{benefit}</Text>)}
          </View>
        ) : null}

        {item.steps?.length ? (
          <View style={styles.stepsBox}>
            <Text style={styles.stepsTitle}>Routine preview</Text>
            {item.steps.slice(0, 5).map((step, index) => (
              <View key={`${item.id}-${step}`} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.cta, hasVideo ? styles.ctaActive : styles.ctaDisabled]}>
          <PlayCircle size={17} color={hasVideo ? colors.white : colors.primary} />
          <Text style={[styles.ctaText, hasVideo ? styles.ctaTextActive : null]}>
            {hasVideo ? "Start Video" : "Add video link from Admin"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeWorkoutScreen() {
  const { items, loading, refreshing, error, refresh } = useProgramContent("home_workout");
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);
  const featured = sortedItems[0];
  const visibleItems = sortedItems.filter((item) => filter === "all" || inferFilter(item) === filter);

  if (loading && !items.length) return <Screen><LoadingState message="Loading home workouts..." /></Screen>;
  if (error && !items.length) return <Screen><ErrorState title="Home workout unavailable" message={error} onRetry={refresh} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <CommonBackButton label="Programs" fallbackPath="/programs" />

        <LinearGradient colors={["#0B6E4F", "#18A06C"]} style={styles.hero}>
          <View style={styles.heroIcon}><Dumbbell size={30} color="#0B6E4F" /></View>
          <Text style={styles.eyebrow}>Home Workout</Text>
          <Text style={styles.title}>Video-ready workouts for every fitness level.</Text>
          <Text style={styles.subtitle}>Beginner, strength, fat-burn and home-items routines. Admin can add YouTube/Firebase links anytime without a new APK.</Text>
          <View style={styles.heroPills}>
            <View style={styles.heroPill}><Clock3 size={14} color="#FFFFFF" /><Text style={styles.heroPillText}>15-28 min</Text></View>
            <View style={styles.heroPill}><ShieldCheck size={14} color="#FFFFFF" /><Text style={styles.heroPillText}>No gym</Text></View>
            <View style={styles.heroPill}><Zap size={14} color="#FFFFFF" /><Text style={styles.heroPillText}>Video links</Text></View>
          </View>
        </LinearGradient>

        {featured ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Today</Text>
            <WorkoutCard item={featured} featured />
          </View>
        ) : null}

        <View style={styles.filterRow}>
          {FILTERS.map((item) => (
            <Pressable key={item.id} onPress={() => setFilter(item.id)} style={[styles.filterChip, filter === item.id ? styles.filterChipActive : null]}>
              <Text style={[styles.filterText, filter === item.id ? styles.filterTextActive : null]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{filter === "all" ? "Workout Library" : `${FILTERS.find((item) => item.id === filter)?.label} Workouts`}</Text>
          {visibleItems.map((item) => <WorkoutCard key={item.id} item={item} />)}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: 32, paddingBottom: 170, gap: spacing.xl },
  hero: { borderRadius: radius.xxl, padding: spacing.xl },
  heroIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  eyebrow: { marginTop: spacing.md, color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  title: { marginTop: spacing.xs, color: colors.white, fontSize: 28, lineHeight: 35, fontWeight: "900" },
  subtitle: { marginTop: spacing.sm, color: "rgba(255,255,255,0.86)", fontSize: 14, lineHeight: 21, fontWeight: "700" },
  heroPills: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  heroPillText: { color: colors.white, fontSize: 11, fontWeight: "900" },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  filterChip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  filterTextActive: { color: colors.white },
  card: { overflow: "hidden", borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  featuredCard: { borderColor: colors.primary },
  pressed: { opacity: 0.78 },
  thumbnail: { width: "100%", height: 168, backgroundColor: colors.softGreen },
  thumbnailFallback: { height: 168, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  thumbnailText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: radius.pill, backgroundColor: colors.softGreen, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  metaText: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  premiumPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, backgroundColor: "#FEF3C7", paddingHorizontal: spacing.sm, paddingVertical: 6 },
  premiumText: { color: "#92400E", fontSize: 11, fontWeight: "900" },
  cardTitle: { color: colors.text, fontSize: 19, lineHeight: 24, fontWeight: "900" },
  cardSubtitle: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  infoBox: { borderRadius: radius.lg, backgroundColor: colors.background, padding: spacing.md },
  infoLabel: { color: colors.mutedText, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  infoText: { marginTop: 4, color: colors.text, fontSize: 13, fontWeight: "800" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  softChip: { borderRadius: radius.pill, backgroundColor: colors.softGreen, color: colors.primary, overflow: "hidden", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 11, fontWeight: "900" },
  stepsBox: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  stepsTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  stepRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  stepNumber: { width: 22, height: 22, borderRadius: 11, textAlign: "center", textAlignVertical: "center", backgroundColor: colors.primary, color: colors.white, fontSize: 11, fontWeight: "900" },
  stepText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  cta: { borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: spacing.sm },
  ctaActive: { backgroundColor: colors.primary },
  ctaDisabled: { backgroundColor: colors.softGreen },
  ctaText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  ctaTextActive: { color: colors.white },
});
