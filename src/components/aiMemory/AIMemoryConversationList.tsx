import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { ConversationSummary } from "../../types";

type AIMemoryConversationListProps = {
  conversations: ConversationSummary[];
};

export function AIMemoryConversationList({ conversations }: AIMemoryConversationListProps) {
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No conversation memory saved yet. AI Coach summaries will appear here automatically.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {conversations.map((conversation) => (
        <View key={conversation.id} style={styles.card}>
          <Text style={styles.summary}>{conversation.summary}</Text>
          {conversation.keyTopics.length > 0 ? (
            <View style={styles.topicRow}>
              {conversation.keyTopics.slice(0, 4).map((topic) => (
                <Text key={`${conversation.id}-${topic}`} style={styles.topic}>{topic}</Text>
              ))}
            </View>
          ) : null}
          {conversation.moodSignal || conversation.riskSignal ? (
            <Text style={styles.signal}>
              {[conversation.moodSignal, conversation.riskSignal].filter(Boolean).join(" • ")}
            </Text>
          ) : null}
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
  summary: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },
  topicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  topic: {
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  signal: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "900",
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
