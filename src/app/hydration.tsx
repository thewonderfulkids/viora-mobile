import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CommonBackButton, Screen } from "../components/common";
import {
  WaterGoalCard,
  WaterHistoryCard,
  WaterProgressCard,
  WaterQuickAdd,
} from "../components/hydration";
import { auth } from "../firebase/firebaseConfig";
import { useDashboard } from "../hooks";
import { useHydration } from "../hooks";
import { useAppTranslation } from "../i18n/useAppTranslation";
import { ActivityLogger } from "../services/activity";
import { colors, spacing } from "../theme";

export default function HydrationScreen() {
  const { t } = useAppTranslation();
  const { data, loading, refresh } = useDashboard();
  const { saving, history, addWater, removeWater } = useHydration();

  const currentMl = data?.todayStats.waterMl || 0;
  const goalMl = data?.user?.waterGoalMl || 2500;

  async function handleAddWater(amountMl: number) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(t("common.loginRequired"), t("common.loginAgain"));
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
      Alert.alert(t("hydration.addError"), error.message || t("common.tryAgain"));
    }
  }

  async function handleRemoveWater(amountMl: number) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(t("common.loginRequired"), t("common.loginAgain"));
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
        t("hydration.removeError"),
        error.message || t("common.tryAgain")
      );
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <CommonBackButton compact fallbackPath="/(tabs)" />

          <View>
            <Text style={styles.kicker}>{t("hydration.kicker")}</Text>
            <Text style={styles.title}>{t("hydration.title")}</Text>
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