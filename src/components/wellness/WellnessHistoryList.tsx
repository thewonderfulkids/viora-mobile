import { Clock3, LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type HistoryItem = {
  id?: string;
  title: string;
  subtitle?: string;
  time?: string;
};

type Props = {
  icon: LucideIcon;
  title: string;
  items: HistoryItem[];
  emptyText?: string;
};

export default function WellnessHistoryList({
  icon: Icon,
  title,
  items,
  emptyText = "No activity yet.",
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{title}</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        items.map((item, index) => (
          <View key={item.id || `${item.title}-${index}`} style={styles.row}>
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <Icon size={17} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>

                {item.subtitle ? (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
            </View>

            {item.time ? (
              <View style={styles.timeWrap}>
                <Clock3 size={13} color={colors.mutedText} />
                <Text style={styles.time}>{item.time}</Text>
              </View>
            ) : null}
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
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  time: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
});