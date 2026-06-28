import { PauseCircle, PlayCircle, StopCircle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  title: string;
  poseName: string;
  currentStep: number;
  totalSteps: number;
  secondsLeft: number;
  running: boolean;
  onToggle: () => void;
  onComplete: () => void;
};

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function YogaTimerCard({
  title,
  poseName,
  currentStep,
  totalSteps,
  secondsLeft,
  running,
  onToggle,
  onComplete,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>ACTIVE SESSION</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.poseCounter}>
        Pose {currentStep} / {totalSteps}
      </Text>

      <Text style={styles.poseTitle}>
       {poseName}
      </Text>

            <View style={styles.progressTrack}>
            <View
                style={[
                styles.progressFill,
                {
                    width: `${(currentStep / totalSteps) * 100}%`,
                },
                ]}
            />
            </View>

      <Text style={styles.timer}>{formatSeconds(secondsLeft)}</Text>

      <View style={styles.actions}>
        <Pressable
            disabled={secondsLeft <= 0}
            onPress={onToggle}
            style={[
                styles.actionButton,
                secondsLeft <= 0 && styles.disabledButton,
            ]}
        >
          {running ? (
            <PauseCircle size={22} color="#FFFFFF" />
          ) : (
            <PlayCircle size={22} color="#FFFFFF" />
          )}

          <Text style={styles.actionText}>{running ? "Pause" : "Resume"}</Text>
        </Pressable>

        <Pressable onPress={onComplete} style={styles.completeButton}>
          <StopCircle size={22} color={colors.primary} />
          <Text style={styles.completeText}>Complete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.text,
    borderRadius: radius.xxl,
    padding: spacing.xl,
  },
  kicker: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  timer: {
    marginTop: spacing.xl,
    color: "#FFFFFF",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },
  actions: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 15,
    alignItems: "center",
    gap: 4,
  },
  completeButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    paddingVertical: 15,
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  poseCounter: {
  marginTop: 8,
  color: "#A7F3D0",
  fontSize: 13,
  fontWeight: "800",
},

poseTitle: {
  marginTop: 4,
  color: "#FFFFFF",
  fontSize: 22,
  fontWeight: "900",
},

progressTrack: {
  marginTop: 20,
  height: 8,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.15)",
  overflow: "hidden",
},

disabledButton: {
  opacity: 0.5,
},

progressFill: {
  height: "100%",
  backgroundColor: "#5EEAD4",
},
  completeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
});