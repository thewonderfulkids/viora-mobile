import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { UsersRound } from "lucide-react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { PremiumJourneyHero } from "../components/premiumExperience";
import { FamilyHero, FamilyInsightList, FamilyInviteCard, FamilyMemberList, FamilyMetricGrid, FamilySection } from "../components/family";
import { useFamilyDashboard } from "../hooks";
import { colors, spacing } from "../theme";

export default function FamilyWellnessScreen() {
  const { dashboard, loading, refreshing, saving, error, refresh, inviteMember, pauseMember } = useFamilyDashboard();

  if (loading && !dashboard) return <LoadingState message="Loading Family Wellness..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load Family Wellness" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Family Wellness unavailable" message="Please try again." onRetry={refresh} />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Wellness" fallbackPath="/(tabs)" />
        <PremiumJourneyHero
          eyebrow="Family Wellness"
          title="A shared view, with personal boundaries."
          subtitle="Support family members through consent-based visibility, invitations and meaningful wellness insights without exposing private details."
          icon={<UsersRound size={29} color="#BE185D" />}
          colors={["#831843", "#BE185D", "#F472B6"]}
          chips={["Up to 4 members", "Consent based", "Separate profiles"]}
        />
        <FamilyHero dashboard={dashboard} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <FamilyMetricGrid metrics={dashboard.metrics} />

        <FamilySection title="Family Members" subtitle="Manage active profiles, pending invitations and shared wellness visibility.">
          <FamilyMemberList members={dashboard.members} saving={saving} onPause={pauseMember} />
        </FamilySection>

        <FamilySection title="Invite & Permissions" subtitle="Elite Family supports up to 4 members. Each member keeps their own data and invoice identity.">
          <FamilyInviteCard
            canInviteMore={dashboard.canInviteMore}
            remainingSlots={dashboard.remainingSlots}
            saving={saving}
            onInvite={inviteMember}
          />
        </FamilySection>

        <FamilySection title="Family AI Insights" subtitle="Viora will use consent-based family signals for reminders, reports and future voice AI.">
          <FamilyInsightList insights={dashboard.insights} />
        </FamilySection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 170,
    gap: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
});
