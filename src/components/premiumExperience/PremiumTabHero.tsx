import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon, Sparkles } from "lucide-react-native";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme";

type PremiumTabHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  colors: readonly [string, string, ...string[]];
  children?: ReactNode;
};

export function PremiumTabHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  colors,
  children,
}: PremiumTabHeroProps) {
  return (
    <LinearGradient colors={colors} style={styles.hero}>
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />

      <View style={styles.topRow}>
        <View style={styles.iconShell}>
          <Icon size={24} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <View style={styles.liveBadge}>
          <Sparkles size={13} color="#FFFFFF" />
          <Text style={styles.liveBadgeText}>Viora intelligence</Text>
        </View>
      </View>

      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {children ? <View style={styles.children}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 268,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    overflow: "hidden",
    position: "relative",
  },
  orbLarge: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.10)",
    right: -78,
    top: -62,
  },
  orbSmall: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.08)",
    left: -30,
    bottom: -46,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.9,
    marginTop: spacing.sm,
    maxWidth: 330,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  children: {
    marginTop: spacing.lg,
  },
});
