import {
  CheckCircle2,
  ChevronRight,
  FileUp,
  Link2,
  ListTree,
  PlayCircle,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

const STEPS = [
  {
    icon: FileUp,
    title: "Choose media",
    text: "Upload video, audio and an optional thumbnail.",
  },
  {
    icon: ListTree,
    title: "Choose category",
    text: "Yoga, workout, music, meditation or sleep.",
  },
  {
    icon: Link2,
    title: "Map exact content",
    text: "Bind it to a program, exercise, pose, session or track.",
  },
  {
    icon: PlayCircle,
    title: "Preview",
    text: "Verify the uploaded file before publishing.",
  },
  {
    icon: CheckCircle2,
    title: "Publish",
    text: "Activate it without releasing a new APK.",
  },
] as const;

export function ContentStudioWorkflowCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>CONTENT STUDIO WORKFLOW</Text>
      <Text style={styles.title}>Upload once. Bind exactly. Publish safely.</Text>
      <Text style={styles.subtitle}>
        Category alone is not enough. Every file should be linked to the exact
        activity or Play button where it belongs.
      </Text>

      <View style={styles.steps}>
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              <View style={styles.stepIcon}>
                <Icon size={18} color={colors.primary} />
              </View>

              <View style={styles.copy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>

              {index < STEPS.length - 1 ? (
                <ChevronRight size={18} color={colors.mutedText} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    backgroundColor: "#062D23",
    overflow: "hidden",
  },
  eyebrow: {
    color: "#A7E8C8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 6,
    color: colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 7,
    color: "rgba(255,255,255,0.66)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  steps: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stepRow: {
    minHeight: 67,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  number: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#98E85F",
  },
  numberText: {
    color: "#063326",
    fontSize: 11,
    fontWeight: "900",
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  copy: {
    flex: 1,
  },
  stepTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  stepText: {
    marginTop: 2,
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
});
