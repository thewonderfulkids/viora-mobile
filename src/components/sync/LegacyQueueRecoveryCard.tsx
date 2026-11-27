import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { inspectLegacySyncQueue } from "../../repositories/syncQueueRepository";
import { colors, radius, spacing } from "../../theme";

type Inventory = Awaited<ReturnType<typeof inspectLegacySyncQueue>>;

/** Read-only: never displays, moves, replays or deletes legacy action payloads. */
export function LegacyQueueRecoveryCard() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setInventory(null);
    setError(null);
    if (!uid) return () => { active = false; };
    setLoading(true);
    inspectLegacySyncQueue()
      .then(result => { if (active) setInventory(result); })
      .catch(err => { if (active) setError(err?.message || "Unable to inspect legacy queue."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [uid, revision]);

  if (!uid) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Legacy offline changes</Text>
      <Text style={styles.description}>
        Older Viora versions stored offline changes in a shared device queue. This check shows counts only.
        Nothing is transferred, synced or deleted.
      </Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.warning}>{error}</Text> : null}
      {inventory?.unreadable ? <Text style={styles.warning}>Legacy queue could not be read. No data was changed.</Text> : null}
      {inventory && !inventory.unreadable ? (
        <Text style={styles.description}>
          Total: {inventory.total} | This account: {inventory.currentUserCount} | Other accounts: {inventory.otherUserCount} | Unknown owner: {inventory.missingOwnerCount}
        </Text>
      ) : null}
      {inventory && inventory.total > 0 ? (
        <Text style={styles.warning}>
          Recovery is not available yet. Please do not clear app storage if you need these older offline changes.
        </Text>
      ) : null}
      <Pressable accessibilityRole="button" disabled={loading} onPress={() => setRevision(value => value + 1)} style={styles.button}>
        <Text style={styles.buttonText}>Check again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  description: { fontSize: 12, lineHeight: 18, color: colors.mutedText },
  warning: { fontSize: 12, lineHeight: 18, color: colors.danger },
  button: { backgroundColor: colors.softGreen, padding: spacing.md, borderRadius: radius.xl, alignItems: "center" },
  buttonText: { color: colors.primaryDark, fontWeight: "800" },
});
