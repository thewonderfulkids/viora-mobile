import { LinearGradient } from "expo-linear-gradient";
import { Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Brain, Clock3, Headphones, Moon, PlayCircle, Sparkles, Wind } from "lucide-react-native";
import { useMemo, useState } from "react";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { useProgramContent } from "../hooks";
import { colors, radius, spacing } from "../theme";
import { AdminManagedContent } from "../types";

type MeditationFilter = "all" | "breathing" | "sleep" | "focus" | "stress";

const FILTERS: { id: MeditationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "breathing", label: "Breathing" },
  { id: "sleep", label: "Sleep" },
  { id: "focus", label: "Focus" },
  { id: "stress", label: "Stress" },
];

function inferFilter(item: AdminManagedContent): MeditationFilter {
  const text = `${item.title} ${item.subtitle} ${item.benefits?.join(" ")}`.toLowerCase();
  if (text.includes("sleep") || text.includes("wind down")) return "sleep";
  if (text.includes("focus") || text.includes("attention")) return "focus";
  if (text.includes("stress") || text.includes("calm") || text.includes("anxiety")) return "stress";
  return "breathing";
}

function openMedia(item: AdminManagedContent) {
  if (item.url) Linking.openURL(item.url);
}

function MeditationVisual({ item }: { item: AdminManagedContent }) {
  if (item.thumbnailUrl) {
    return <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />;
  }

  return (
    <LinearGradient colors={["#F5F3FF", "#FFFFFF"]} style={styles.thumbnailFallback}>
      {item.mediaType === "video" ? <PlayCircle size={30} color="#7C3AED" /> : <Headphones size={30} color="#7C3AED" />}
      <Text style={styles.thumbnailText}>{item.url ? "Media Ready" : "Admin Link Ready"}</Text>
    </LinearGradient>
  );
}

function MeditationCard({ item, featured = false }: { item: AdminManagedContent; featured?: boolean }) {
  const hasMedia = Boolean(item.url);
  const mediaLabel = item.mediaType === "video" ? "Guided video" : item.mediaType === "audio" ? "Audio session" : "Session";

  return (
    <Pressable
      onPress={() => openMedia(item)}
      disabled={!hasMedia}
      style={({ pressed }) => [styles.card, featured ? styles.featuredCard : null, pressed ? styles.pressed : null]}
    >
      <MeditationVisual item={item} />

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}><Clock3 size={13} color="#7C3AED" /><Text style={styles.metaText}>{item.durationMinutes || 5} min</Text></View>
          <View style={styles.metaPill}><Headphones size={13} color="#7C3AED" /><Text style={styles.metaText}>{mediaLabel}</Text></View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        {item.benefits?.length ? (
          <View style={styles.chipWrap}>
            {item.benefits.slice(0, 4).map((benefit) => <Text key={benefit} style={styles.softChip}>{benefit}</Text>)}
          </View>
        ) : null}

        {item.steps?.length ? (
          <View style={styles.stepsBox}>
            <Text style={styles.stepsTitle}>Session flow</Text>
            {item.steps.slice(0, 5).map((step, index) => (
              <View key={`${item.id}-${step}`} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.cta, hasMedia ? styles.ctaActive : styles.ctaDisabled]}>
          <PlayCircle size={17} color={hasMedia ? colors.white : "#7C3AED"} />
          <Text style={[styles.ctaText, hasMedia ? styles.ctaTextActive : null]}>
            {hasMedia ? "Start Session" : "Add audio/video link from Admin"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function MeditationScreen() {
  const { items, loading, refreshing, error, refresh } = useProgramContent("meditation");
  const [filter, setFilter] = useState<MeditationFilter>("all");

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);
  const featured = sortedItems[0];
  const visibleItems = sortedItems.filter((item) => filter === "all" || inferFilter(item) === filter);

  if (loading && !items.length) return <Screen><LoadingState message="Loading meditation sessions..." /></Screen>;
  if (error && !items.length) return <Screen><ErrorState title="Meditation unavailable" message={error} onRetry={refresh} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <CommonBackButton label="Wellness" fallbackPath="/(tabs)/wellness" />

        <LinearGradient colors={["#5B21B6", "#7C3AED", "#A78BFA"]} style={styles.hero}>
          <View style={styles.heroIcon}><Brain size={30} color="#5B21B6" /></View>
          <Text style={styles.eyebrow}>Meditation</Text>
          <Text style={styles.title}>Audio and video-ready calm sessions.</Text>
          <Text style={styles.subtitle}>Breathing, sleep, focus and stress-reset sessions. Admin can add YouTube, Firebase audio or video links anytime.</Text>
          <View style={styles.heroPills}>
            <View style={styles.heroPill}><Wind size={14} color="#FFFFFF" /><Text style={styles.heroPillText}>Breathing</Text></View>
            <View style={styles.heroPill}><Moon size={14} color="#FFFFFF" /><Text style={styles.heroPillText}>Sleep</Text></View>
            <View style={styles.heroPill}><Sparkles size={14} color="#FFFFFF" /><Text style={styles.heroPillText}>Mindful</Text></View>
          </View>
        </LinearGradient>

        {featured ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Today</Text>
            <MeditationCard item={featured} featured />
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
          <Text style={styles.sectionTitle}>{filter === "all" ? "Meditation Library" : `${FILTERS.find((item) => item.id === filter)?.label} Sessions`}</Text>
          {visibleItems.map((item) => <MeditationCard key={item.id} item={item} />)}
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
  filterChipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  filterText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  filterTextActive: { color: colors.white },
  card: { overflow: "hidden", borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  featuredCard: { borderColor: "#7C3AED" },
  pressed: { opacity: 0.78 },
  thumbnail: { width: "100%", height: 168, backgroundColor: "#F5F3FF" },
  thumbnailFallback: { height: 168, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  thumbnailText: { color: "#7C3AED", fontSize: 12, fontWeight: "900" },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: radius.pill, backgroundColor: "#F5F3FF", paddingHorizontal: spacing.sm, paddingVertical: 6 },
  metaText: { color: "#7C3AED", fontSize: 11, fontWeight: "900" },
  cardTitle: { color: colors.text, fontSize: 19, lineHeight: 24, fontWeight: "900" },
  cardSubtitle: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  softChip: { borderRadius: radius.pill, backgroundColor: "#F5F3FF", color: "#7C3AED", overflow: "hidden", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 11, fontWeight: "900" },
  stepsBox: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  stepsTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  stepRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  stepNumber: { width: 22, height: 22, borderRadius: 11, textAlign: "center", textAlignVertical: "center", backgroundColor: "#7C3AED", color: colors.white, fontSize: 11, fontWeight: "900" },
  stepText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  cta: { borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: spacing.sm },
  ctaActive: { backgroundColor: "#7C3AED" },
  ctaDisabled: { backgroundColor: "#F5F3FF" },
  ctaText: { color: "#7C3AED", fontSize: 13, fontWeight: "900" },
  ctaTextActive: { color: colors.white },
});
