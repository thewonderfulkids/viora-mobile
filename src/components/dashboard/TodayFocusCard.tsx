import { Target } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type TodayFocusCardProps = {
  focus: string;
};

export function TodayFocusCard({ focus }: TodayFocusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Target size={22} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Today&apos;s Focus</Text>
        <Text style={styles.title}>{focus}</Text>
        <Text style={styles.subtitle}>
          Viora recommends keeping your attention here today.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  label: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});