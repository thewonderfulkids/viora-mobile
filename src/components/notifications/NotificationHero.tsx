import { BellRing } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { WellnessReminder } from "../../types";

type Props = {
  enabled: boolean;
  nextReminder: WellnessReminder | null;
};

export function NotificationHero({ enabled, nextReminder }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <BellRing size={26} color={colors.white} />
      </View>

      <Text style={styles.eyebrow}>Viora Smart Notifications</Text>
      <Text style={styles.title}>{enabled ? "Reminder Engine Active" : "Reminder Engine Paused"}</Text>
      <Text style={styles.subtitle}>
        {nextReminder
          ? `${nextReminder.title}: ${nextReminder.message}`
          : "Viora will create wellness reminders from your settings, AI memory and activity context."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.primary,
    padding: spacing.xl,
    overflow: "hidden",
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    marginTop: spacing.xs,
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
});
