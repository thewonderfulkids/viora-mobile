import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "../components/common";
import {
  WaterGoalCard,
  WaterHistoryCard,
  WaterProgressCard,
  WaterQuickAdd,
} from "../components/hydration";
import { auth } from "../firebase/firebaseConfig";
import { useDashboard } from "../hooks/useDashboard";
import { useHydration } from "../hooks/useHydration";
import { ActivityLogger } from "../services/activity";
import { colors, spacing } from "../theme";

export default function HydrationScreen() {
  const { data, loading, refresh } = useDashboard();
  const { saving, history, addWater, removeWater } = useHydration();

  const currentMl = data?.todayStats.waterMl || 0;
  const goalMl = data?.user?.waterGoalMl || 2500;

  async function handleAddWater(amountMl: number) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    try {
      await addWater(amountMl);

      await ActivityLogger.hydration({
        userId: currentUser.uid,
        amountMl,
        direction: "add",
      });

      await refresh();
    } catch (error: any) {
      Alert.alert("Unable to add water", error.message || "Please try again.");
    }
  }

  async function handleRemoveWater(amountMl: number) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    try {
      await removeWater(amountMl);

      await ActivityLogger.hydration({
        userId: currentUser.uid,
        amountMl,
        direction: "remove",
      });

      await refresh();
    } catch (error: any) {
      Alert.alert(
        "Unable to remove water",
        error.message || "Please try again."
      );
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          <View>
            <Text style={styles.kicker}>HYDRATION</Text>
            <Text style={styles.title}>Water Tracker</Text>
          </View>
        </View>

        <WaterProgressCard currentMl={currentMl} goalMl={goalMl} />

        <WaterQuickAdd
          saving={saving || loading}
          onAdd={handleAddWater}
          onRemove={handleRemoveWater}
        />

        <WaterGoalCard goalMl={goalMl} />

        <WaterHistoryCard history={history} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 40,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
});