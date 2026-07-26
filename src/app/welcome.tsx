import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { PremiumEntryHero } from "../components/firstImpression";
import { colors, radius, spacing } from "../theme";

const BENEFITS = [
  ["body-outline", "Move better", "Yoga and home workouts built around your routine."],
  ["moon-outline", "Recover deeply", "Sleep, stress and mindfulness guidance in one place."],
  ["sparkles-outline", "Know what matters", "AI turns your wellness data into simple next steps."],
] as const;

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={["#F5FBF7", "#ECF8F1", "#FFFFFF"]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <View style={styles.mark}><Text style={styles.markText}>V</Text></View>
            <View><Text style={styles.brand}>Viora</Text><Text style={styles.powered}>by WinFly</Text></View>
          </View>

          <PremiumEntryHero
            eyebrow="Your daily wellness companion"
            title="Feel better, one smart habit at a time."
            subtitle="A calmer, healthier routine designed for real Indian schedules—not perfect ones."
          />

          <View style={styles.benefits}>
            {BENEFITS.map(([icon, title, copy]) => (
              <View key={title} style={styles.benefitCard}>
                <View style={styles.iconWrap}><Ionicons name={icon} size={21} color={colors.primary} /></View>
                <View style={styles.benefitCopy}><Text style={styles.benefitTitle}>{title}</Text><Text style={styles.benefitText}>{copy}</Text></View>
              </View>
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.push("/signup")}>
            <Text style={styles.primaryText}>Create my wellness plan</Text><Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/login")}>
            <Text style={styles.secondaryText}>I already have an account</Text>
          </Pressable>
          <Text style={styles.footer}>No gym pressure. No confusing dashboards. Just progress.</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, safe: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 36, gap: spacing.xl },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  mark: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  markText: { color: colors.white, fontSize: 26, fontWeight: "900" },
  brand: { color: colors.text, fontSize: 23, fontWeight: "900", letterSpacing: -0.5 },
  powered: { color: colors.mutedText, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.1 },
  benefits: { gap: 10 },
  benefitCard: { flexDirection: "row", gap: spacing.md, alignItems: "center", backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.softGreen },
  benefitCopy: { flex: 1 }, benefitTitle: { color: colors.text, fontSize: 15, fontWeight: "900" }, benefitText: { marginTop: 3, color: colors.mutedText, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  primaryButton: { minHeight: 58, borderRadius: radius.pill, paddingHorizontal: spacing.xl, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: colors.primary },
  primaryText: { color: colors.white, fontSize: 16, fontWeight: "900" },
  secondaryButton: { alignItems: "center", paddingVertical: 4 }, secondaryText: { color: colors.primaryDark, fontSize: 14, fontWeight: "900" },
  footer: { textAlign: "center", color: colors.mutedText, fontSize: 11, lineHeight: 16, fontWeight: "700" },
});
