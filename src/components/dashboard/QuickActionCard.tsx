import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type QuickActionCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export default function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <LinearGradient colors={["#F7FBF8", "#FFFFFF"]} style={styles.card}>
        <View style={styles.iconBox}>
          <Icon size={20} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
});