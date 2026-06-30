import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { ReportRange } from "../../types";

const ranges: { label: string; value: ReportRange }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

type ReportRangeTabsProps = {
  value: ReportRange;
  onChange: (range: ReportRange) => void;
};

export function ReportRangeTabs({ value, onChange }: ReportRangeTabsProps) {
  return (
    <View style={styles.container}>
      {ranges.map((item) => {
        const active = item.value === value;
        return (
          <Pressable key={item.value} onPress={() => onChange(item.value)} style={[styles.tab, active && styles.activeTab]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "900",
  },
  activeLabel: {
    color: colors.white,
  },
});
