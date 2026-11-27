import { router } from "expo-router";
import {
  BellRing,
  ChevronRight,
  FileText,
  Globe2,
  KeyRound,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react-native";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CommonBackButton,
  ErrorState,
  LoadingState,
  Screen,
} from "../components/common";
import { PremiumEntryHero } from "../components/firstImpression";
import { LegacyQueueRecoveryCard } from "../components/sync/LegacyQueueRecoveryCard";
import {
  AccountSummaryCard,
  SettingsSection,
} from "../components/settings";
import { useAuth } from "../context/AuthContext";
import { useSettingsCenter } from "../hooks";
import { isVioraAccessAdmin } from "../services/adminAccess";
import { colors, radius, spacing } from "../theme";

type RoutePath =
  | "/language-settings"
  | "/premium"
  | "/notification-preferences"
  | "/notification-center"
  | "/privacy-ai-safety"
  | "/account-security"
  | "/delete-account"
  | "/family-wellness"
  | "/reports"
  | "/admin"
  | "/programs";

type CardProps = {
  icon: any;
  title: string;
  subtitle: string;
  route: RoutePath;
  tone?: "green" | "gold";
};

function RouteCard({
  icon: Icon,
  title,
  subtitle,
  route,
  tone = "green",
}: CardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => router.push(route as never)}
      style={({ pressed }) => [
        styles.routeCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.routeIcon,
          tone === "gold" && styles.goldIcon,
        ]}
      >
        <Icon
          size={20}
          color={tone === "gold" ? "#9A6700" : colors.primary}
        />
      </View>

      <View style={styles.routeCopy}>
        <Text style={styles.routeTitle}>{title}</Text>
        <Text style={styles.routeSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.chevronWrap}>
        <ChevronRight size={20} color={colors.mutedText} />
      </View>
    </Pressable>
  );
}

export default function SettingsCenterScreen() {
  const { user } = useAuth();
  const {
    dashboard,
    loading,
    refreshing,
    error,
    refresh,
  } = useSettingsCenter();

  const showAdmin = isVioraAccessAdmin(user?.email);

  if (loading && !dashboard) {
    return <LoadingState message="Loading your preferences..." />;
  }

  if (error && !dashboard) {
    return (
      <ErrorState
        title="Unable to load settings"
        message={error}
        onRetry={refresh}
      />
    );
  }

  if (!dashboard) {
    return (
      <ErrorState
        title="Settings unavailable"
        message="Please try again."
        onRetry={refresh}
      />
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
      >
        <CommonBackButton
          label="Profile"
          fallbackPath="/(tabs)"
        />

        <PremiumEntryHero
          compact
          eyebrow="Your control center"
          title="Make Viora work your way."
          subtitle="Manage your plan, privacy, reminders and account from one clean space."
        />

        <AccountSummaryCard dashboard={dashboard} />

        <LegacyQueueRecoveryCard />

        <SettingsSection
          title="Membership & experience"
          subtitle="Personalize how Viora supports your routine."
        >
          <RouteCard
            icon={WalletCards}
            title="Subscription & payments"
            subtitle="Plans, access and billing history"
            route="/premium"
            tone="gold"
          />
          <RouteCard
            icon={Globe2}
            title="Language"
            subtitle="English, Hindi or Hinglish"
            route="/language-settings"
          />
          <RouteCard
            icon={BellRing}
            title="Notification Center"
            subtitle="Premium schedules, quiet hours and reminders"
            route="/notification-center"
          />
          <RouteCard
            icon={SlidersHorizontal}
            title="Programs hub"
            subtitle="Yoga, workout and wellness programs"
            route="/programs"
          />
          <RouteCard
            icon={UsersRound}
            title="Family wellness"
            subtitle="Members, invites and shared access"
            route="/family-wellness"
          />
        </SettingsSection>

        <SettingsSection
          title="Privacy & account"
          subtitle="Your data and account remain under your control."
        >
          <RouteCard
            icon={ShieldCheck}
            title="Privacy & AI safety"
            subtitle="Memory, personalization and exports"
            route="/privacy-ai-safety"
          />
          <RouteCard
            icon={Lock}
            title="Account security"
            subtitle="Password and account protection"
            route="/account-security"
          />
          <RouteCard
            icon={FileText}
            title="Reports"
            subtitle="Daily, weekly and monthly summaries"
            route="/reports"
          />
          {showAdmin ? (
            <RouteCard
              icon={KeyRound}
              title="Admin Content Studio"
              subtitle="Upload and map Viora videos, audio and programs"
              route="/admin"
            />
          ) : null}
          <RouteCard
            icon={Trash2}
            title="Delete account"
            subtitle="Request permanent account deletion"
            route="/delete-account"
          />
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 24,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  routeCard: {
    minHeight: 82,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  routeIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  goldIcon: {
    backgroundColor: "#FFF7DA",
  },
  routeCopy: {
    flex: 1,
  },
  routeTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  routeSubtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F7F4",
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.995 }],
  },
});
