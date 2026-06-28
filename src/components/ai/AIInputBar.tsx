import { Send } from "lucide-react-native";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function AIInputBar({
  value,
  onChangeText,
  onSend,
  disabled,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask Viora..."
        placeholderTextColor={colors.mutedText}
        style={styles.input}
        multiline
      />

      <Pressable
        disabled={disabled || value.trim().length === 0}
        onPress={onSend}
        style={[
          styles.button,
          (disabled || value.trim().length === 0) && styles.disabled,
        ]}
      >
        <Send size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  button: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});