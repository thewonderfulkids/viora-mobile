import { Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";

type DashboardHeaderProps = {
  greeting: string;
  name: string;
  subtitle: string;
};

export default function DashboardHeader({
  greeting,
  name,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Sparkles size={16} color={colors.primary} />
        <Text style={styles.badgeText}>{greeting}</Text>
      </View>

      <Text style={styles.title}>Your Viora Journey, {name}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF7EF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },
});