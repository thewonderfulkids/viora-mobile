import { Moon, Sunrise } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  sleepStart: string;
  sleepEnd: string;
  onPickSleepStart: () => void;
  onPickSleepEnd: () => void;
  onSave: () => void;
  saving?: boolean;
};

export default function SleepLogCard({
  sleepStart,
  sleepEnd,
  onPickSleepStart,
  onPickSleepEnd,
  onSave,
  saving,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Log Your Sleep</Text>

      <Pressable
        style={styles.row}
        onPress={onPickSleepStart}
      >
        <View style={styles.left}>
          <Moon size={20} color={colors.primary} />
          <Text style={styles.label}>Bed Time</Text>
        </View>

        <Text style={styles.value}>
          {sleepStart || "Select"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={onPickSleepEnd}
      >
        <View style={styles.left}>
          <Sunrise size={20} color={colors.primary} />
          <Text style={styles.label}>Wake Time</Text>
        </View>

        <Text style={styles.value}>
          {sleepEnd || "Select"}
        </Text>
      </Pressable>

      <Pressable
        disabled={saving}
        style={[
          styles.button,
          saving && styles.disabled,
        ]}
        onPress={onSave}
      >
        <Text style={styles.buttonText}>
          Save Sleep
        </Text>
      </Pressable>
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  label: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },

  value: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 15,
  },

  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});