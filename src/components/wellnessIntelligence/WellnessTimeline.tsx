import { StyleSheet, Text, View } from "react-native";
import { WellnessTimelineEvent } from "../../types/wellnessIntelligence";
import { colors, radius, spacing } from "../../theme";

type WellnessTimelineProps = { items: WellnessTimelineEvent[] };

export function WellnessTimeline({ items }: WellnessTimelineProps) {
  if (!items.length) return <Text style={styles.empty}>Timeline will appear after wellness activity is logged.</Text>;

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.dot} />
          <View style={styles.content}>
            <Text style={styles.date}>{item.dateKey}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  item: { flexDirection: "row", gap: spacing.md },
  dot: { marginTop: 7, width: 10, height: 10, borderRadius: 999, backgroundColor: colors.primary },
  content: { flex: 1 },
  date: { color: colors.mutedText, fontSize: 11, fontWeight: "900" },
  title: { marginTop: 2, color: colors.text, fontSize: 14, fontWeight: "900" },
  description: { marginTop: 3, color: colors.mutedText, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  empty: { color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
});
