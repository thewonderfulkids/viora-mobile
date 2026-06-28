import { Target } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  goalMl: number;
};

export default function WaterGoalCard({ goalMl }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Target size={22} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Daily Water Goal</Text>
        <Text style={styles.goal}>{goalMl} ml</Text>
        <Text style={styles.subtitle}>
          Stay consistent throughout the day for better energy and focus.
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
    alignItems: "center",
    gap: spacing.lg,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
  },
  goal: {
    marginTop: 4,
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
});