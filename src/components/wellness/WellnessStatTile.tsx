import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
};

export default function WellnessStatTile({
  icon: Icon,
  label,
  value,
  hint,
}: Props) {
  return (
    <LinearGradient colors={["#FFFFFF", "#F7FBF8"]} style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon size={20} color={colors.primary} />
      </View>

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "900",
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});