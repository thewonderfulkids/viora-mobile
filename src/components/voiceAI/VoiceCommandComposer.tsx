import { Mic, Send, Volume2, VolumeX } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { VoiceProviderStatus } from "../../types";

type Props = {
  transcript: string;
  status: VoiceProviderStatus;
  saving: boolean;
  speaking: boolean;
  onChangeTranscript: (value: string) => void;
  onStartListening: () => void;
  onSubmit: () => void;
  onStopSpeaking: () => void;
};

export function VoiceCommandComposer({
  transcript,
  status,
  saving,
  speaking,
  onChangeTranscript,
  onStartListening,
  onSubmit,
  onStopSpeaking,
}: Props) {
  const isListening = status === "listening";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Speak or type a command</Text>
      <Text style={styles.subtitle}>
        Try: “I drank 500 ml water”, “Show my weekly report”, or “I had tea and two bread slices”.
      </Text>

      <TextInput
        value={transcript}
        onChangeText={onChangeTranscript}
        placeholder="Type a voice command fallback..."
        placeholderTextColor={colors.mutedText}
        multiline
        style={styles.input}
      />

      <View style={styles.actionRow}>
        <Pressable
          disabled={saving}
          onPress={onStartListening}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isListening && styles.listening]}
        >
          <Mic size={18} color={colors.white} />
          <Text style={styles.primaryButtonText}>{isListening ? "Listening..." : "Tap to Speak"}</Text>
        </Pressable>

        <Pressable
          disabled={saving || !transcript.trim()}
          onPress={onSubmit}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, (!transcript.trim() || saving) && styles.disabled]}
        >
          <Send size={17} color={colors.primaryDark} />
          <Text style={styles.secondaryButtonText}>{saving ? "Processing" : "Run"}</Text>
        </Pressable>

        <Pressable
          disabled={!speaking}
          onPress={onStopSpeaking}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed, !speaking && styles.disabled]}
        >
          {speaking ? <VolumeX size={18} color={colors.primaryDark} /> : <Volume2 size={18} color={colors.primaryDark} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  input: {
    minHeight: 92,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    textAlignVertical: "top",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listening: {
    backgroundColor: colors.teal,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
