import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebaseConfig";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { SettingsInfoCard, SettingsSection } from "../components/settings";
import { useSettingsCenter } from "../hooks";
import { colors, spacing } from "../theme";

export default function DeleteAccountScreen() {
  const { dashboard, loading, refreshing, saving, error, refresh, updatePreferences } = useSettingsCenter();
  const [deletionStatus, setDeletionStatus] = useState<string | null>(null);
  const [requestedAt, setRequestedAt] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, "accountDeletionRequests", uid), snapshot => {
      const data = snapshot.data();
      setDeletionStatus(snapshot.exists() ? String(data?.status ?? "unknown") : null);
      setRequestedAt(data?.requestedAt?.toDate?.()?.toLocaleDateString?.() ?? null);
      setStatusError(false);
    }, () => setStatusError(true));
  }, []);


  if (loading && !dashboard) return <LoadingState message="Loading account deletion controls..." />;
  if (error && !dashboard) return <ErrorState title="Unable to load delete account" message={error} onRetry={refresh} />;
  if (!dashboard) return <ErrorState title="Delete account unavailable" message="Please try again." onRetry={refresh} />;

  function requestDeleteAccount() {
    Alert.alert(
      "Request account deletion",
      "This submits a verified deletion request for review. It does not immediately delete your account or data. You must have signed in within the last five minutes.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request deletion", style: "destructive", onPress: async () => {
          try {
            await httpsCallable(functions, "requestAccountDeletion")({});
            await updatePreferences({ deleteAccountRequestedAt: new Date().toISOString() });
            Alert.alert("Request received", "Your account deletion request has been securely recorded for review. Your account and data have not been deleted yet.");
          } catch (error: any) {
            Alert.alert("Request not submitted", error?.message || "Please sign in again and retry.");
          }
        } },
      ]
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton label="Profile" fallbackPath="/(tabs)" />

        <SettingsSection
          title="Delete Account"
          subtitle="Submit a secure deletion request. Actual account and data removal is not yet available."
        >
          <SettingsInfoCard
            title="Deletion status"
            subtitle={statusError ? "Unable to verify server deletion status." : deletionStatus ? `Server status: ${deletionStatus}${requestedAt ? ` · Requested ${requestedAt}` : ""}. Deletion is not yet complete.` : "No active deletion request found on the server."}
          />
          <SettingsInfoCard
            title="Safety note"
            subtitle="Requests require recent authentication and are stored for review. This does not permanently delete your data yet."
          >
            <Text style={styles.deleteText} onPress={requestDeleteAccount}>Request account deletion →</Text>
          </SettingsInfoCard>
          {saving ? <Text style={styles.savingText}>Saving request...</Text> : null}
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
  deleteText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  savingText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
});
