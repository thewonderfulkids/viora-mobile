import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { RefreshCw } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Screen } from "../../components/common";
import {
  DashboardAchievementGrid,
  DashboardFamilySnapshotCard,
  DashboardSmartActionGrid,
  DashboardTimelineCard,
} from "../../components/dashboardIntelligence";
import { PremiumHomeHero, PremiumMetricRail, PremiumSectionHeader } from "../../components/premium";
import { useDashboardIntelligence } from "../../hooks";
import { premiumPalette } from "../../theme/premium";

export default function DashboardScreen() {
  const { intelligence, loading, error, refresh } = useDashboardIntelligence();

  if (loading && !intelligence) {
    return (
      <Screen>
        <SafeAreaView style={styles.stateSafe}>
          <LinearGradient colors={[premiumPalette.forest, premiumPalette.emerald]} style={styles.loadingCard}>
            <View style={styles.loadingOrb} />
            <Text style={styles.loadingKicker}>VIORA</Text>
            <Text style={styles.loadingTitle}>Preparing your wellness day</Text>
            <Text style={styles.loadingText}>Bringing together your sleep, movement, hydration and AI guidance.</Text>
          </LinearGradient>
        </SafeAreaView>
      </Screen>
    );
  }

  if (error || !intelligence) {
    return (
      <Screen>
        <SafeAreaView style={styles.stateSafe}>
          <View style={styles.errorCard}>
            <Text style={styles.errorEyebrow}>DASHBOARD OFFLINE</Text>
            <Text style={styles.errorTitle}>Your wellness overview could not load.</Text>
            <Text style={styles.errorText}>{error || "Please check your connection and try again."}</Text>
            <Pressable style={styles.retryButton} onPress={refresh}>
              <RefreshCw size={17} color={premiumPalette.white} />
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={premiumPalette.emerald} />}
        >
          <PremiumHomeHero briefing={intelligence.briefing} wellnessScore={intelligence.wellnessScore} />

          <View style={styles.metricWrap}>
            <PremiumMetricRail trends={intelligence.trends} />
          </View>

          <View style={styles.section}>
            <PremiumSectionHeader
              eyebrow="PERSONALIZED FOR TODAY"
              title="Smart actions"
              subtitle="Small, high-impact steps selected from your current wellness signals."
              onPress={() => router.push("/wellness")}
            />
            <DashboardSmartActionGrid actions={intelligence.smartActions.slice(0, 4)} />
          </View>

          <View style={styles.section}>
            <PremiumSectionHeader
              eyebrow="YOUR DAILY FLOW"
              title="Today&apos;s rhythm"
              subtitle="A simple sequence to keep your day balanced without feeling overwhelming."
            />
            <DashboardTimelineCard items={intelligence.timeline} />
          </View>

          <DashboardFamilySnapshotCard snapshot={intelligence.familySnapshot} />

          <View style={styles.section}>
            <PremiumSectionHeader
              eyebrow="MOMENTUM"
              title="Wins worth noticing"
              subtitle="Progress feels better when the small victories are visible."
              onPress={() => router.push("/(tabs)/progress")}
            />
            <DashboardAchievementGrid achievements={intelligence.achievements} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 130, gap: 27 },
  metricWrap: { marginTop: -8 },
  section: { gap: 15 },
  stateSafe: { flex: 1, justifyContent: "center", padding: 20 },
  loadingCard: { minHeight: 340, borderRadius: 34, padding: 26, justifyContent: "flex-end", overflow: "hidden" },
  loadingOrb: { position: "absolute", width: 260, height: 260, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.09)", right: -90, top: -80 },
  loadingKicker: { color: premiumPalette.lime, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  loadingTitle: { marginTop: 7, color: premiumPalette.white, fontSize: 31, lineHeight: 37, fontWeight: "900", letterSpacing: -0.7 },
  loadingText: { marginTop: 10, color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 21, fontWeight: "600" },
  errorCard: { borderRadius: 30, padding: 24, backgroundColor: premiumPalette.white, borderWidth: 1, borderColor: premiumPalette.line },
  errorEyebrow: { color: premiumPalette.coral, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  errorTitle: { marginTop: 8, color: premiumPalette.ink, fontSize: 25, lineHeight: 31, fontWeight: "900" },
  errorText: { marginTop: 9, color: premiumPalette.inkMuted, fontSize: 14, lineHeight: 21, fontWeight: "600" },
  retryButton: { marginTop: 20, minHeight: 50, borderRadius: 17, backgroundColor: premiumPalette.emerald, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  retryText: { color: premiumPalette.white, fontSize: 14, fontWeight: "900" },
});
