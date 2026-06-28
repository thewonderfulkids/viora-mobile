import { CheckCircle2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  items: string[];
};

export default function TodaysPlanCard({ items }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.kicker}>TODAY</Text>
        <Text style={styles.heading}>Your Journey</Text>
      </View>

      {items.map((item, index) => (
        <View key={item} style={styles.row}>
          <View style={styles.timeline}>
            <CheckCircle2 size={18} color={colors.primary} />
            {index < items.length - 1 ? <View style={styles.line} /> : null}
          </View>

          <Text style={styles.item}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  heading: {
    marginTop: 4,
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  timeline: {
    alignItems: "center",
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: "#DDEBE3",
    marginVertical: 4,
  },
  item: {
    flex: 1,
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
    lineHeight: 22,
    paddingBottom: spacing.md,
  },
});