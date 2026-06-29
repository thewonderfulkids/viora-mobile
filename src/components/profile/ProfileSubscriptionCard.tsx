import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

type Props = {
  onUpgrade: () => void;
};

export function ProfileSubscriptionCard({ onUpgrade }: Props) {
  return (
    <LinearGradient colors={["#111827", "#0B6E4F"]} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Sparkles size={24} color="#FDE68A" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Viora Plus</Text>
          <Text style={styles.title}>Unlock premium wellness intelligence</Text>
          <Text style={styles.text}>
            Voice AI, weekly reports, advanced memory and smart recommendations.
          </Text>
        </View>
      </View>

      <Pressable onPress={onUpgrade} style={styles.button}>
        <Text style={styles.buttonText}>Upgrade Plan</Text>
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
  },
  label: {
    color: "#A7F3D0",
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
    color: "#D1FAE5",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  button: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});