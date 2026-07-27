import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommonBackButton, Screen } from "../components/common";
import { StepCounterCard } from "../components/steps";
import { useStepCounter } from "../hooks/useStepCounter";
import { premiumPalette, premiumShadow } from "../theme/premium";

const GOALS = [5000, 8000, 10000, 12000];

export default function StepsScreen() {
  const data = useStepCounter();
  const percent = Math.round(data.progress * 100);

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <CommonBackButton />
          <StepCounterCard />

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>PERSONAL TARGET</Text>
              <Text style={styles.title}>Choose your daily goal</Text>
            </View>
            <Text style={styles.meta}>{percent}% complete</Text>
          </View>

          <View style={styles.goalGrid}>
            {GOALS.map((goal) => {
              const selected = goal === data.goal;
              return (
                <Pressable
                  key={goal}
                  onPress={() => data.setGoal(goal)}
                  style={[styles.goalCard, selected && styles.goalCardSelected]}
                >
                  <Text style={[styles.goalValue, selected && styles.goalValueSelected]}>
                    {goal.toLocaleString()}
                  </Text>
                  <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
                    DAILY STEPS
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <LinearGradient
            colors={["#F6FCF8", "#ECF9F1"]}
            style={styles.aiCard}
          >
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={24} color={premiumPalette.emerald} />
            </View>
            <View style={styles.aiCopy}>
              <Text style={styles.aiEyebrow}>VIORA AI INSIGHT</Text>
              <Text style={styles.aiTitle}>Movement does not need to be intense.</Text>
              <Text style={styles.aiText}>
                Short walks spread across the day can support mood, circulation and sleep.
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.infoCard}>
            <Ionicons name="hardware-chip-outline" size={24} color={premiumPalette.sky} />
            <Text style={styles.infoText}>
              Current mode tracks live pedometer steps while Viora is active and saves today&apos;s total locally.
            </Text>
          </View>

          {data.error ? <Text style={styles.error}>{data.error}</Text> : null}

          <Pressable style={styles.refreshButton} onPress={data.refresh}>
            <Ionicons name="refresh" size={18} color={premiumPalette.white} />
            <Text style={styles.refreshText}>Refresh movement data</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 130,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  eyebrow: {
    color: premiumPalette.emerald,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 4,
    color: premiumPalette.ink,
    fontSize: 23,
    fontWeight: "900",
  },
  meta: {
    color: premiumPalette.inkMuted,
    fontSize: 10,
    fontWeight: "900",
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  goalCard: {
    width: "48%",
    minHeight: 102,
    borderRadius: 22,
    padding: 16,
    backgroundColor: premiumPalette.white,
    borderWidth: 1,
    borderColor: premiumPalette.line,
    ...premiumShadow.card,
  },
  goalCardSelected: {
    backgroundColor: premiumPalette.forest,
    borderColor: premiumPalette.forest,
  },
  goalValue: {
    color: premiumPalette.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  goalValueSelected: { color: premiumPalette.white },
  goalLabel: {
    marginTop: 17,
    color: premiumPalette.inkMuted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  goalLabelSelected: { color: premiumPalette.mint },
  aiCard: {
    borderRadius: 24,
    padding: 19,
    flexDirection: "row",
    gap: 13,
    ...premiumShadow.card,
  },
  aiIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: premiumPalette.white,
  },
  aiCopy: { flex: 1 },
  aiEyebrow: {
    color: premiumPalette.emerald,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  aiTitle: {
    marginTop: 5,
    color: premiumPalette.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  aiText: {
    marginTop: 7,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },
  infoCard: {
    borderRadius: 22,
    padding: 17,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EDF8FD",
  },
  infoText: {
    flex: 1,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },
  error: {
    color: premiumPalette.coral,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  refreshButton: {
    minHeight: 56,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: premiumPalette.emerald,
  },
  refreshText: {
    color: premiumPalette.white,
    fontSize: 14,
    fontWeight: "900",
  },
});
