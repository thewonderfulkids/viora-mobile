import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { AIMemoryRecord } from "../../types/aiMemory";

type AIMemoryRecordListProps = {
  memories: AIMemoryRecord[];
  emptyText: string;
};

function formatConfidence(value: number) {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

export function AIMemoryRecordList({ memories, emptyText }: AIMemoryRecordListProps) {
  if (memories.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {memories.map((memory) => (
        <View key={memory.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{memory.title}</Text>
            <Text style={styles.confidence}>{formatConfidence(memory.confidence)}</Text>
          </View>
          <Text style={styles.summary}>{memory.summary}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{memory.source}</Text>
            <Text style={styles.meta}>{memory.importance}</Text>
            <Text style={styles.meta}>{memory.category}</Text>
          </View>
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
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  confidence: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  summary: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  meta: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
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
