import { Brain, ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

export function ProfileAIMemoryCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Brain size={22} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>AI Memory</Text>
          <Text style={styles.text}>
            Viora is learning from your wellness habits, conversations and activity history.
          </Text>
        </View>

        <ChevronRight size={20} color={colors.mutedText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  text: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
});