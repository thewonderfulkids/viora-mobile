import { LinearGradient } from "expo-linear-gradient";
import { Crown, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PremiumPlan } from "../../types/premium";

export function PremiumHero({ currentPlan }: { currentPlan: PremiumPlan }) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconShell}>
          <Crown size={26} color={colors.white} />
        </View>
        <View style={styles.livePill}>
          <Sparkles size={14} color={colors.primaryDark} />
          <Text style={styles.liveText}>Premium Ready</Text>
        </View>
      </View>

      <Text style={styles.kicker}>Premium Membership</Text>
      <Text style={styles.title}>Upgrade Viora into your premium AI wellness system.</Text>
      <Text style={styles.subtitle}>
        Current plan: {currentPlan.displayName}. Unlock AI coaching, advanced intelligence, reports, programs and family-ready wellness.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  iconShell: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  liveText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.softGreen,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
});
