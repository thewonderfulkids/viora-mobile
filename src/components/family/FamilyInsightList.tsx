import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { FamilyInsight } from "../../types";

type Props = { insights: FamilyInsight[] };

function borderColor(tone: FamilyInsight["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.border;
}

export function FamilyInsightList({ insights }: Props) {
  return (
    <View style={styles.list}>
      {insights.map((item) => (
        <View key={item.id} style={[styles.card, { borderColor: borderColor(item.tone) }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: { borderRadius: radius.xl, borderWidth: 1, backgroundColor: colors.white, padding: spacing.lg },
  title: { color: colors.text, fontSize: 15, fontWeight: "900" },
  message: { marginTop: spacing.xs, color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
});
