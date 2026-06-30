import { LockKeyhole, Unlock } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";
import { ReportOption, ReportRange } from "../../types";

type ReportOptionListProps = {
  options: ReportOption[];
  onSelectRange: (range: ReportRange) => void;
  onUpgrade: () => void;
};

export function ReportOptionList({ options, onSelectRange, onUpgrade }: ReportOptionListProps) {
  return (
    <View style={styles.container}>
      {options.map((item) => (
        <Pressable key={item.id} style={styles.card} onPress={() => item.locked ? onUpgrade() : onSelectRange(item.range)}>
          <View style={styles.iconShell}>
            {item.locked ? <LockKeyhole size={18} color={colors.warning} /> : <Unlock size={18} color={colors.primary} />}
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={item.locked ? styles.locked : styles.open}>{item.ctaLabel}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  open: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  locked: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "900",
  },
});
