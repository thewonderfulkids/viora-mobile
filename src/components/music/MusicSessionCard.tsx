import { PlayCircle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MusicCatalogItem } from "../../services/musicService";
import { colors, radius, spacing } from "../../theme";

type Props = {
  session: MusicCatalogItem;
  saving?: boolean;
  onStart: (id: string) => void;
};

export default function MusicSessionCard({
  session,
  saving,
  onStart,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>
          {session.therapyType}
        </Text>

        <Text style={styles.title}>
          {session.title}
        </Text>

        <Text style={styles.description}>
          {session.description}
        </Text>

        <Text style={styles.duration}>
          {session.durationMinutes} min
        </Text>
      </View>

      <Pressable
        disabled={saving}
        onPress={() => onStart(session.id)}
        style={[
          styles.button,
          saving && styles.disabled,
        ]}
      >
        <PlayCircle size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          Play
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  type: {
    color: "#7C3AED",
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
  },
  duration: {
    marginTop: spacing.md,
    color: colors.text,
    fontWeight: "900",
  },
  button: {
    backgroundColor: "#7C3AED",
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});