import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { AIMemoryTimelineItem } from "../../types/aiMemory";

type AIMemoryTimelineProps = {
  items: AIMemoryTimelineItem[];
};

export function AIMemoryTimeline({ items }: AIMemoryTimelineProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Your AI memory timeline will appear after Viora records activity or conversation learning.</Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rail}>
            <View style={styles.dot} />
            <View style={styles.line} />
          </View>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.date}>{item.dateLabel}</Text>
              <Text style={styles.source}>{String(item.source)}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rail: {
    width: 18,
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  date: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  source: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
