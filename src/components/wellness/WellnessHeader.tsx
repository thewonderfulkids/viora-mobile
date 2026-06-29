import { StyleSheet, Text, View } from "react-native";

import { CommonBackButton } from "../common";
import { colors, spacing } from "../../theme";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export default function WellnessHeader({
  title,
  subtitle,
  showBack = true,
}: Props) {
  return (
    <View style={styles.container}>
      {showBack ? <CommonBackButton compact fallbackPath="/(tabs)" /> : null}

      <View style={styles.content}>
        <Text style={styles.kicker}>VIORA WELLNESS</Text>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
  kicker: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.3,
  },
  title: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 6,
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
});
