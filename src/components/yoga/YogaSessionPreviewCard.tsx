import { Flame, ListChecks, PlayCircle, Timer, Waves } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { YogaCatalogItem } from "../../services/yogaService";
import { colors, radius, spacing } from "../../theme";

type Props = {
  session: YogaCatalogItem;
  onStart: () => void;
  onClose: () => void;
};

export default function YogaSessionPreviewCard({
  session,
  onStart,
  onClose,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        {session.yogaType} • {session.difficulty}
      </Text>

      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.description}>{session.description}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Timer size={18} color={colors.primary} />
          <Text style={styles.statText}>{session.durationMinutes} min</Text>
        </View>

        <View style={styles.stat}>
          <Flame size={18} color={colors.primary} />
          <Text style={styles.statText}>~{session.caloriesEstimate} kcal</Text>
        </View>

        <View style={styles.stat}>
          <Waves size={18} color={colors.primary} />
          <Text style={styles.statText}>{session.difficulty}</Text>
        </View>
      </View>

      <View style={styles.focusBox}>
        <Text style={styles.focusLabel}>Focus</Text>
        <Text style={styles.focusText}>{session.focus}</Text>
      </View>

      <View style={styles.stepsBox}>
        <View style={styles.stepsHeader}>
          <ListChecks size={18} color={colors.primary} />
          <Text style={styles.stepsTitle}>Session Steps</Text>
        </View>

        {session.steps.map((step, index) => (
        <Text key={step.title} style={styles.stepText}>
            {index + 1}. {step.title} ({step.durationSeconds}s)
        </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onClose} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Close</Text>
        </Pressable>

        <Pressable onPress={onStart} style={styles.primaryButton}>
          <PlayCircle size={20} color="#FFFFFF" />
          <Text style={styles.primaryText}>Start Session</Text>
        </Pressable>
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
    padding: spacing.xl,
  },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 6,
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  description: {
    marginTop: 8,
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  statsRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAF7EF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  focusBox: {
    marginTop: spacing.lg,
    backgroundColor: "#F7FBF8",
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  focusLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  focusText: {
    marginTop: 5,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  stepsBox: {
    marginTop: spacing.lg,
  },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  stepText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F7FBF8",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});