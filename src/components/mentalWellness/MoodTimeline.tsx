import { StyleSheet, Text, View } from "react-native";

import { MoodTimelineItem } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

type MoodTimelineProps = {
  items: MoodTimelineItem[];
};

function dotColor(tone: MoodTimelineItem["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.teal;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function MoodTimeline({ items }: MoodTimelineProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Timeline will appear after check-ins</Text>
        <Text style={styles.emptyText}>Your mood history will power reports, AI Coach context and future voice summaries.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: dotColor(item.tone) }]} />
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.time}>{formatTime(item.time)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  item: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dot: {
    marginTop: 6,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    ...typography.caption,
  },
  time: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  emptyCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.mutedText,
    ...typography.caption,
  },
});
