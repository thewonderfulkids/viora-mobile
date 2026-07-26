import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import {
  BillingHistoryList,
  PremiumFeatureComparison,
  PremiumHero,
  PremiumPlanCard,
  PremiumSection,
  ProgramEntitlementList,
  SubscriptionStatusCard,
} from "../components/premium";
import { usePremium } from "../hooks";
import { PremiumEntryHero } from "../components/firstImpression";
import { colors, spacing } from "../theme";
import { PremiumPlanCode } from "../types";

export default function PremiumScreen() {
  const {
    dashboard,
    loading,
    refreshing,
    error,
    processingPlanCode,
    activePlanCode,
    refresh,
    startPlanCheckout,
  } = usePremium();

  async function handleSelectPlan(planCode: PremiumPlanCode) {
    if (planCode === "FREE") return;

    const plan = dashboard?.plans.find((item) => item.code === planCode);
    if (!plan) return;

    Alert.alert(
      "Activate beta access",
      `${plan.displayName} will be activated for beta testing. Razorpay checkout will be connected in the payment release.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          onPress: () => {
            startPlanCheckout(planCode, "manual");
          },
        },
      ]
    );
  }

  if (loading && !dashboard) {
    return (
      <Screen>
        <LoadingState message="Loading premium membership..." />
      </Screen>
    );
  }

  if (error && !dashboard) {
    return (
      <Screen>
        <ErrorState title="Unable to load premium" message={error} onRetry={refresh} />
      </Screen>
    );
  }

  if (!dashboard) {
    return (
      <Screen>
        <ErrorState title="Premium unavailable" message="Please try again." onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Dashboard" />

        <PremiumEntryHero compact eyebrow="Viora membership" title="Go deeper with your wellness." subtitle="Unlock richer guidance, programs and family experiences while keeping your current progress intact." />

        <PremiumHero currentPlan={dashboard.currentPlan} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <SubscriptionStatusCard plan={dashboard.currentPlan} subscription={dashboard.subscription} />

        <PremiumSection
          title="Choose your Viora plan"
          subtitle="Choose a plan for beta testing. During beta, paid plan cards activate access directly without opening payment checkout."
        >
          {dashboard.plans.map((plan) => (
            <PremiumPlanCard
              key={plan.code}
              plan={plan}
              activePlanCode={activePlanCode}
              processing={processingPlanCode === plan.code}
              onSelect={handleSelectPlan}
            />
          ))}
        </PremiumSection>

        <PremiumFeatureComparison features={dashboard.currentPlan.features} />

        <ProgramEntitlementList
          items={dashboard.programEntitlements}
          activePlanCode={dashboard.currentPlan.code}
        />

        <BillingHistoryList payments={dashboard.payments} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 44,
    gap: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },
});
