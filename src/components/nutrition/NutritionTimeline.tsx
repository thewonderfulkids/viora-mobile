import { Clock3 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { NutritionTimelineItem } from "../../types";

type NutritionTimelineProps = {
  items: NutritionTimelineItem[];
};

export function NutritionTimeline({ items }: NutritionTimelineProps) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <View key={item.id} style={[styles.row, index === items.length - 1 && styles.lastRow]}>
          <View style={styles.iconShell}>
            <Clock3 size={15} color={colors.primary} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  time: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
});
