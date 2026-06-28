import { router } from "expo-router";
import {
  Droplets,
  Moon,
  Music2,
  Plus,
  Sparkles,
  Waves,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/common";
import {
  AIInsightCard,
  DashboardHeader,
  QuickActionCard,
  StatCard,
  TodayFocusCard,
  TodaysPlanCard,
  WellnessScoreCard,
} from "../../components/dashboard";
import { useDashboard } from "../../hooks/useDashboard";
import { buildDashboardViewModel } from "../../services/dashboard";
import { colors, spacing } from "../../theme";

export default function DashboardScreen() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <Text style={styles.loadingText}>Loading your Viora dashboard...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {error || "Unable to load dashboard"}
          </Text>
        </View>
      </Screen>
    );
  }

  const viewModel = buildDashboardViewModel(data);

  const dashboard = viewModel.dashboard;
  const analytics = viewModel.analytics;

  const firstName =
    dashboard.user?.fullName?.split(" ")?.[0] || "there";

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <DashboardHeader
          greeting={dashboard.greeting}
          name={firstName}
          subtitle={`Goal: ${
            dashboard.user?.goal || "Healthy Lifestyle"
          } • Stress: ${dashboard.user?.stressLevel || "Moderate"}`}
        />

        <WellnessScoreCard score={dashboard.wellnessScore} />
        <TodayFocusCard focus={analytics.todayFocus} />

        <AIInsightCard
          title={analytics.insight.title}
          insight={analytics.insight.description}
        />

        <View style={styles.grid}>
          <StatCard
            icon={Droplets}
            label="Water"
            value={`${dashboard.todayStats.waterMl} ml`}
            hint={`Goal ${dashboard.user?.waterGoalMl || 2500} ml`}
          />

          <StatCard
            icon={Moon}
            label="Sleep"
            value={`${Math.round(dashboard.todayStats.sleepMinutes / 60)}h`}
            hint="Target 7h+"
          />
        </View>

        <View style={styles.grid}>
          <StatCard
            icon={Waves}
            label="Yoga"
            value={`${dashboard.todayStats.yogaMinutes} min`}
            hint="Move gently"
          />

          <StatCard
            icon={Music2}
            label="Music"
            value={`${dashboard.todayStats.musicMinutes} min`}
            hint="Relax mind"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <QuickActionCard
            icon={Plus}
            title="Add Water"
            subtitle="Log your hydration"
            onPress={() => router.push("/hydration")}
          />

          <QuickActionCard
            icon={Waves}
            title="Yoga"
            subtitle="Daily movement"
            onPress={() => router.push("/yoga" as any)}
          />
        </View>

        <View style={styles.grid}>
          <QuickActionCard
            icon={Moon}
            title="Sleep"
            subtitle="Track your sleep"
            onPress={() => router.push("/sleep")}
          />

          <QuickActionCard
            icon={Sparkles}
            title="AI Coach"
            subtitle="Get daily guidance"
            onPress={() => router.push("/ai-coach" as any)}
          />
        </View>

        <View style={styles.grid}>
          <QuickActionCard
            icon={Music2}
            title="Music Therapy"
            subtitle="Relax your mind"
            onPress={() => router.push("/music" as any)}
          />
        </View>

        <TodaysPlanCard items={dashboard.tasks.map((task) => task.title)} />
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#B42318",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
});