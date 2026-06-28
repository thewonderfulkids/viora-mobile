import { PlayCircle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { YogaCatalogItem } from "../../services/yogaService";
import { colors, radius, spacing } from "../../theme";

type Props = {
  session: YogaCatalogItem;
  saving?: boolean;
  onStart: (sessionId: string) => void;
};

export default function YogaSessionCard({ session, saving, onStart }: Props) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.kicker}>
          {session.yogaType} • {session.difficulty}
        </Text>

        <Text style={styles.title}>{session.title}</Text>
        <Text style={styles.description}>{session.description}</Text>

        <Text style={styles.duration}>{session.durationMinutes} min</Text>
      </View>

      <Pressable
        disabled={saving}
        onPress={() => onStart(session.id)}
        style={[styles.button, saving && styles.disabled]}
      >
        <PlayCircle size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Start</Text>
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
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  description: {
    marginTop: 6,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  duration: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
});