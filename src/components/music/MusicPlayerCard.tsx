import {
    PauseCircle,
    PlayCircle,
    StopCircle,
    Volume2,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme";

type Props = {
  title: string;
  therapyType: string;
  secondsLeft: number;
  running: boolean;
  onToggle: () => void;
  onComplete: () => void;
};

function format(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MusicPlayerCard({
  title,
  therapyType,
  secondsLeft,
  running,
  onToggle,
  onComplete,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Volume2 size={24} color="#FFFFFF" />
      </View>

      <Text style={styles.type}>{therapyType}</Text>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.timer}>
        {format(secondsLeft)}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onToggle}
          style={styles.primaryButton}
        >
          {running ? (
            <PauseCircle size={22} color="#FFFFFF" />
          ) : (
            <PlayCircle size={22} color="#FFFFFF" />
          )}

          <Text style={styles.primaryText}>
            {running ? "Pause" : "Resume"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onComplete}
          style={styles.secondaryButton}
        >
          <StopCircle size={22} color="#7C3AED" />

          <Text style={styles.secondaryText}>
            Complete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: "center",
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },

  type: {
    marginTop: spacing.md,
    color: "#C4B5FD",
    fontSize: 13,
    fontWeight: "900",
  },

  title: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  timer: {
    marginTop: spacing.xl,
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "900",
  },

  actions: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },

  primaryButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: "center",
    gap: 5,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: "center",
    gap: 5,
  },

  primaryText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  secondaryText: {
    color: "#7C3AED",
    fontWeight: "900",
  },
});