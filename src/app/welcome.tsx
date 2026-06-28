import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme";

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={["#F7FBF8", "#EAF7EF", "#FFFFFF"]}
      style={styles.container}
    >
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>V</Text>
        </View>

        <Text style={styles.brand}>Viora</Text>
        <Text style={styles.tagline}>Live Better. Every Day.</Text>
        <Text style={styles.powered}>Powered by WinFly</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wellness that fits your life</Text>
        <Text style={styles.cardText}>
          Home workouts, yoga, meditation, sound therapy and AI coaching for
          busy professionals and families.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryButtonText}>Start Your Journey</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>No Gym. No Equipment. No Excuses.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    justifyContent: "space-between",
  },
  logoWrap: {
    alignItems: "center",
    marginTop: spacing.xxxl,
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  logoText: {
    color: colors.white,
    fontSize: 56,
    fontWeight: "800",
  },
  brand: {
    marginTop: spacing.xl,
    fontSize: 42,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 17,
    color: colors.mutedText,
    fontWeight: "600",
  },
  powered: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  cardText: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 23,
    color: colors.mutedText,
  },
  primaryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.primaryDark,
    fontWeight: "700",
  },
});