import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { SmartNotificationStat } from "../../types";

type Props = {
  stats: SmartNotificationStat[];
};

export function NotificationStatGrid({ stats }: Props) {
  return (
    <View style={styles.grid}>
      {stats.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.helper}>{item.helper}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47%",
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  value: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: "900",
  },
  label: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  helper: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
});
