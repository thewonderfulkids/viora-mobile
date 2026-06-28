import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../theme";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: StatCardProps) {
  return (
    <LinearGradient
      colors={["#FFFFFF", "#F7FBF8"]}
      style={styles.card}
    >
      <View style={styles.iconBox}>
        <Icon size={20} color={colors.primary} />
      </View>

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  label: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
  },
  value: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
    fontWeight: "700",
  },
}); 