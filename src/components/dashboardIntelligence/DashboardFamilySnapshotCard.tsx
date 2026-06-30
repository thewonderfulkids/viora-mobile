import { router } from "expo-router";
import { Users } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardFamilySnapshot } from "../../types/dashboardIntelligence";
import { colors, radius, spacing } from "../../theme";

export function DashboardFamilySnapshotCard({ snapshot }: { snapshot: DashboardFamilySnapshot }) {
  if (!snapshot.enabled) return null;

  return (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: snapshot.route as never })}>
      <View style={styles.iconBox}>
        <Users size={20} color={colors.white} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>Elite Family Ready</Text>
        <Text style={styles.title}>{snapshot.title}</Text>
        <Text style={styles.description}>{snapshot.description}</Text>
      </View>
      <Text style={styles.cta}>Open →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  kicker: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  description: {
    color: colors.softGreen,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  cta: {
    color: colors.mint,
    fontSize: 13,
    fontWeight: "900",
  },
});
