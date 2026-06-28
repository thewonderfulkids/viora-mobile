import { Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

export default function AIHeader() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Sparkles size={26} color="#7C3AED" />
      </View>

      <Text style={styles.title}>Viora AI Coach</Text>

      <Text style={styles.subtitle}>
        Your personalized wellness companion powered by AI.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: spacing.md,
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: colors.mutedText,
    lineHeight: 22,
  },
});