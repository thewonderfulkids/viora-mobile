import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function WellnessActionButton({
  icon: Icon,
  title,
  subtitle,
  onPress,
  disabled = false,
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={["#FFFFFF", "#F8FCFA"]}
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <Icon size={22} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          {subtitle ? (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
  },

  pressed: {
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.5,
  },

  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
});