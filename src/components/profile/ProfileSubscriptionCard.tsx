import { LinearGradient } from "expo-linear-gradient";
import { Crown, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  onUpgrade: () => void;
};

export function ProfileSubscriptionCard({ onUpgrade }: Props) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Crown size={24} color={colors.warning} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.label}>Viora Membership</Text>
          <Text style={styles.title}>Premium AI wellness plans are ready</Text>
          <Text style={styles.text}>
            Plus, Pro and Elite Family unlock advanced AI, reports, programs and voice-ready wellness.
          </Text>
        </View>
      </View>

      <Pressable onPress={onUpgrade} style={styles.button}>
        <Sparkles size={16} color={colors.primaryDark} />
        <Text style={styles.buttonText}>View Premium Plans</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  copy: {
    flex: 1,
  },
  label: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 4,
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
  },
  text: {
    marginTop: 5,
    color: colors.softGreen,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
});
