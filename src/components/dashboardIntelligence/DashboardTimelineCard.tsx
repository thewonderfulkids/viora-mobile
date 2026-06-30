import { router } from "expo-router";
import { CheckCircle2, Circle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardTimelineItem } from "../../types/dashboardIntelligence";
import { colors, radius, spacing } from "../../theme";

export function DashboardTimelineCard({ items }: { items: DashboardTimelineItem[] }) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => {
        const Icon = item.completed ? CheckCircle2 : Circle;
        return (
          <Pressable
            key={item.id}
            style={[styles.item, index === items.length - 1 && styles.lastItem]}
            onPress={() => router.push({ pathname: item.route as never })}
          >
            <View style={styles.iconColumn}>
              <Icon size={20} color={item.completed ? colors.primary : colors.mutedText} />
              {index !== items.length - 1 ? <View style={styles.line} /> : null}
            </View>

            <View style={styles.copy}>
              <Text style={styles.time}>{item.timeLabel}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  item: {
    flexDirection: "row",
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  lastItem: {
    paddingBottom: 0,
  },
  iconColumn: {
    alignItems: "center",
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: spacing.xs,
    backgroundColor: colors.border,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  time: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
