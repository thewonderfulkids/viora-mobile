import { Bell, Brain, Moon, Sparkles, Waves } from "lucide-react-native";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { SmartReminderSettings } from "../../types/notifications";

type PreferenceKey = "hydration" | "sleep" | "yoga" | "aiMemory" | "weeklyInsight";

type Props = {
  settings: SmartReminderSettings;
  saving: boolean;
  onToggleEngine: (enabled: boolean) => void;
  onTogglePreference: (key: PreferenceKey, enabled: boolean) => void;
};

const ITEMS: Array<{
  key: PreferenceKey;
  title: string;
  subtitle: string;
  icon: any;
}> = [
  {
    key: "hydration",
    title: "Hydration reminders",
    subtitle: "Daily water nudges",
    icon: Waves,
  },
  {
    key: "sleep",
    title: "Sleep routine",
    subtitle: "Wind-down reminders",
    icon: Moon,
  },
  {
    key: "yoga",
    title: "Yoga sessions",
    subtitle: "Movement and breathing nudges",
    icon: Bell,
  },
  {
    key: "aiMemory",
    title: "AI memory nudges",
    subtitle: "Personalized from learned habits",
    icon: Brain,
  },
  {
    key: "weeklyInsight",
    title: "Weekly insights",
    subtitle: "AI learning summaries",
    icon: Sparkles,
  },
];

export function ReminderSettingsCard({
  settings,
  saving,
  onToggleEngine,
  onTogglePreference,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Reminder Settings</Text>
          <Text style={styles.subtitle}>In-app notification control center</Text>
        </View>
        <Switch value={settings.enabled} disabled={saving} onValueChange={onToggleEngine} />
      </View>

      {ITEMS.map(({ key, title, subtitle, icon: Icon }) => {
        const preference = settings[key];

        return (
          <View key={key} style={styles.item}>
            <View style={styles.iconBox}>
              <Icon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemSubtitle}>
                {subtitle} • {preference.preferredTime}
              </Text>
            </View>
            <Switch
              value={preference.enabled}
              disabled={saving || !settings.enabled}
              onValueChange={(value) => onTogglePreference(key, value)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  itemSubtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
});
