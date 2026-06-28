import { Clock3, Droplets } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type HistoryItem = {
  amountMl: number;
  time: string;
};

type Props = {
  history: HistoryItem[];
};

export default function WaterHistoryCard({ history }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Today's Activity</Text>

      {history.length === 0 ? (
        <Text style={styles.empty}>
          No water logged yet.
        </Text>
      ) : (
        history.map((item, index) => (
          <View
            key={`${item.time}-${index}`}
            style={styles.row}
          >
            <View style={styles.left}>
              <Droplets
                size={18}
                color={colors.primary}
              />

              <Text style={styles.amount}>
                {item.amountMl} ml
              </Text>
            </View>

            <View style={styles.right}>
              <Clock3
                size={14}
                color={colors.mutedText}
              />

              <Text style={styles.time}>
                {item.time}
              </Text>
            </View>
          </View>
        ))
      )}
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
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  empty: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  amount: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  time: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
});