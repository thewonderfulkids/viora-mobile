import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type PremiumEntryHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  compact?: boolean;
};

export function PremiumEntryHero({ eyebrow, title, subtitle, compact = false }: PremiumEntryHeroProps) {
  return (
    <LinearGradient
      colors={["#063B2C", "#0B6E4F", "#13A47A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, compact ? styles.compactHero : null]}
    >
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <View style={styles.badge}>
        <Ionicons name="sparkles" size={15} color="#D9FFE9" />
        <Text style={styles.badgeText}>{eyebrow}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.signalRow}>
        <View style={styles.signalItem}><Ionicons name="heart" size={15} color="#D9FFE9" /><Text style={styles.signalText}>Personal</Text></View>
        <View style={styles.signalItem}><Ionicons name="shield-checkmark" size={15} color="#D9FFE9" /><Text style={styles.signalText}>Private</Text></View>
        <View style={styles.signalItem}><Ionicons name="flash" size={15} color="#D9FFE9" /><Text style={styles.signalText}>Actionable</Text></View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 250,
    borderRadius: 34,
    padding: spacing.xl,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  compactHero: { minHeight: 220 },
  orbOne: {
    position: "absolute", width: 190, height: 190, borderRadius: 95,
    right: -55, top: -70, backgroundColor: "rgba(255,255,255,0.12)",
  },
  orbTwo: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    left: -35, bottom: -55, backgroundColor: "rgba(126,217,87,0.15)",
  },
  badge: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7,
    borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: { color: "#E9FFF2", fontSize: 11, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  title: { marginTop: spacing.lg, color: colors.white, fontSize: 34, lineHeight: 39, fontWeight: "900", letterSpacing: -1.1, maxWidth: 330 },
  subtitle: { marginTop: spacing.sm, color: "#D7F5E5", fontSize: 14, lineHeight: 21, fontWeight: "700", maxWidth: 340 },
  signalRow: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  signalItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: "rgba(0,0,0,0.13)" },
  signalText: { color: "#E9FFF2", fontSize: 11, fontWeight: "800" },
});
