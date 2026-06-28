import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

export default function AITypingIndicator() {
  return (
    <View style={styles.bubble}>
      <Text style={styles.text}>Viora is thinking...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  text: {
    color: colors.mutedText,
    fontWeight: "800",
  },
});