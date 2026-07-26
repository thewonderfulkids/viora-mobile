import { router } from "expo-router";
import { BellRing, Bug, ClipboardCheck, FileText, Globe2, KeyRound, Lock, ShieldCheck, Trash2, UsersRound, WalletCards, RefreshCw, SlidersHorizontal } from "lucide-react-native";
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { AccountSummaryCard, SettingsSection } from "../components/settings";
import { useSettingsCenter } from "../hooks";
import { useAuth } from "../context/AuthContext";
import { isVioraAccessAdmin } from "../services/adminAccess";
import { colors, radius, spacing } from "../theme";

type RoutePath = "/language-settings" | "/premium" | "/notification-preferences" | "/privacy-ai-safety" | "/account-security" | "/delete-account" | "/family-wellness" | "/reports" | "/sync-diagnostics" | "/beta-feedback" | "/launch-candidate" | "/admin-access" | "/admin" | "/programs";

type SettingsRouteCardProps = {
  icon: any;
  title: string;
  subtitle: string;
  route: RoutePath;
};

function SettingsRouteCard({ icon: Icon, title, subtitle, route }: SettingsRouteCardProps) {
  return (
    <Pressable onPress={() => router.push({ pathname: route as never })} style={({ pressed }) => [styles.routeCard, pressed ? styles.pressed : null]}>
      <View style={styles.routeIcon}>
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={styles.routeCopy}>
        <Text style={styles.routeTitle}>{title}</Text>
        <Text style={styles.routeSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function SettingsCenterScreen() {
  const { user } = useAuth();
  const { dashboard, loading, refreshing, error, refresh } = useSettingsCenter();
  const showAdminAccess = isVioraAccessAdmin(user?.email);

  if (loading && !dashboard) return <LoadingState message="Loading settings center..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load settings" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Settings unavailable" message="Please try again." onRetry={refresh} />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Profile" fallbackPath="/(tabs)" />
        <AccountSummaryCard dashboard={dashboard} />

        <SettingsSection title="Settings & Preferences" subtitle="Your active control center for Viora V1.">
          <SettingsRouteCard icon={Globe2} title="Language" subtitle="English, Hindi and Hinglish preference" route="/language-settings" />
          <SettingsRouteCard icon={WalletCards} title="Subscription & Payments" subtitle="Plans, invoices and billing" route="/premium" />
          <SettingsRouteCard icon={BellRing} title="Smart Notifications" subtitle="Reminder preferences" route="/notification-preferences" />
          <SettingsRouteCard icon={UsersRound} title="Family Wellness" subtitle="Members, invites and Elite Family access" route="/family-wellness" />
          <SettingsRouteCard icon={SlidersHorizontal} title="Programs Hub" subtitle="Yoga, Home Workout and Weight Loss programs" route="/programs" />
          <SettingsRouteCard icon={ShieldCheck} title="Privacy & AI Safety" subtitle="AI memory, personalization and data export" route="/privacy-ai-safety" />
          <SettingsRouteCard icon={Lock} title="Account Security" subtitle="Password reset and account protection" route="/account-security" />
          <SettingsRouteCard icon={RefreshCw} title="Sync & Diagnostics" subtitle="Offline queue, beta build info and sync health" route="/sync-diagnostics" />
          <SettingsRouteCard icon={Bug} title="Bug Report & Beta Feedback" subtitle="Submit APK issues with automatic diagnostics" route="/beta-feedback" />
          <SettingsRouteCard icon={ClipboardCheck} title="V1 Launch Candidate" subtitle="Final readiness checks and APK release checklist" route="/launch-candidate" />
          {showAdminAccess ? (
            <SettingsRouteCard icon={KeyRound} title="Admin Control Panel" subtitle="Users, plans, content, music, videos and app flags" route="/admin" />
          ) : null}
          <SettingsRouteCard icon={Trash2} title="Delete Account" subtitle="Safe account deletion request" route="/delete-account" />
        </SettingsSection>

        <SettingsSection title="Reports" subtitle="AI wellness exports and progress summaries.">
          <SettingsRouteCard icon={FileText} title="Reports" subtitle="Daily, weekly and monthly AI wellness reports" route="/reports" />
        </SettingsSection>
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
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  routeIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
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
  chevron: {
    color: colors.mutedText,
    fontSize: 32,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
  },
  futureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
  },
  futureText: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
