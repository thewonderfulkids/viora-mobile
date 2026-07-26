import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  colors: readonly [string, string, ...string[]];
  chips?: string[];
};

export function PremiumJourneyHero({ eyebrow, title, subtitle, icon, colors: gradientColors, chips = [] }: Props) {
  return (
    <LinearGradient colors={[...gradientColors]} style={styles.hero}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>{icon}</View>
        <View style={styles.livePill}>
          <Sparkles size={13} color={colors.white} />
          <Text style={styles.liveText}>Viora Intelligence</Text>
        </View>
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {chips.length ? (
        <View style={styles.chipRow}>
          {chips.slice(0, 4).map((chip) => (
            <View key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: "hidden", borderRadius: radius.xxl, padding: spacing.xl, minHeight: 248 },
  glowOne: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.13)", right: -55, top: -70 },
  glowTwo: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.08)", left: -42, bottom: -62 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconWrap: { width: 58, height: 58, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.95)", justifyContent: "center", alignItems: "center" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.16)" },
  liveText: { color: colors.white, fontSize: 10, fontWeight: "900", letterSpacing: 0.4 },
  eyebrow: { marginTop: spacing.lg, color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  title: { marginTop: spacing.xs, color: colors.white, fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { marginTop: spacing.sm, maxWidth: 520, color: "rgba(255,255,255,0.86)", fontSize: 13, lineHeight: 20, fontWeight: "700" },
  chipRow: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.16)", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipText: { color: colors.white, fontSize: 10, fontWeight: "900" },
});
