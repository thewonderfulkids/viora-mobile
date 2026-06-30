import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingState, Screen } from "../components/common";
import { colors, spacing } from "../theme";

export default function VoiceAIScreen() {
  useEffect(() => {
    router.replace("/ai-coach?mode=voice" as any);
  }, []);

  return (
    <Screen>
      <View style={styles.container}>
        <LoadingState message="Opening Voice AI inside AI Coach..." />
        <Text style={styles.note}>
          Voice AI now works inside your AI Coach conversation.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  note: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
