import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  role: "user" | "assistant";
  message: string;
};

export default function AIMessageBubble({
  role,
  message,
}: Props) {
  const user = role === "user";

  return (
    <View
      style={[
        styles.bubble,
        user ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text
        style={[
          styles.text,
          user && styles.userText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "85%",
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  aiBubble: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  text: {
    color: colors.text,
    lineHeight: 22,
    fontSize: 15,
  },
  userText: {
    color: "#FFFFFF",
  },
});