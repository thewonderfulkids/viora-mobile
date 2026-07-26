import { StyleSheet, Text, View } from "react-native";

import { PendingSyncAction } from "../../types";
import { colors, radius, spacing } from "../../theme";

type SyncQueueListProps = {
  items: PendingSyncAction[];
};

export function SyncQueueList({ items }: SyncQueueListProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No pending actions</Text>
        <Text style={styles.emptyText}>Viora is clean. New offline actions will appear here until they sync.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.itemTop}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.badge}>{item.status}</Text>
          </View>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.meta}>{new Date(item.updatedAt).toLocaleString()} · Attempts {item.attempts}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  item: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  badge: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    color: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  description: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
