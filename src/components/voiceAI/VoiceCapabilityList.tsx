import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { VoiceAICapability } from "../../types";

type Props = {
  capabilities: VoiceAICapability[];
};

function statusColor(status: VoiceAICapability["status"]) {
  if (status === "active") return colors.primary;
  if (status === "ready") return colors.teal;
  return colors.mutedText;
}

export function VoiceCapabilityList({ capabilities }: Props) {
  return (
    <View style={styles.list}>
      {capabilities.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={[styles.badge, { borderColor: statusColor(item.status) }]}>
              <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  description: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
