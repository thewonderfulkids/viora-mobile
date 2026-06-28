import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimePicker({ label, value, onChange }: Props) {
  if (Platform.OS === "web") {
    const webValue = `${String(value.getHours()).padStart(2, "0")}:${String(
      value.getMinutes()
    ).padStart(2, "0")}`;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>

        <input
          type="time"
          value={webValue}
          onChange={(event) => {
            const [hours, minutes] = event.target.value.split(":").map(Number);

            const next = new Date(value);
            next.setHours(hours, minutes, 0, 0);

            onChange(next);
          }}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#10231C",
            fontSize: 16,
            fontWeight: 900,
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.nativeValue}>{formatTime(value)}</Text>

      <DateTimePicker
        value={value}
        mode="time"
        display="default"
        onChange={(_, selectedDate) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  label: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  nativeValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
});