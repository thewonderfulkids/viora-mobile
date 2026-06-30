import { PauseCircle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { FamilyMember } from "../../types";

type Props = {
  members: FamilyMember[];
  saving: boolean;
  onPause: (memberId: string) => void;
};

function statusText(member: FamilyMember) {
  if (member.status === "invited") return "Invite Pending";
  if (member.status === "paused") return "Paused";
  return "Active";
}

export function FamilyMemberList({ members, saving, onPause }: Props) {
  return (
    <View style={styles.list}>
      {members.map((member) => (
        <View key={member.id} style={styles.card}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{member.avatarEmoji}</Text></View>
          <View style={styles.copy}>
            <Text style={styles.name}>{member.displayName}</Text>
            <Text style={styles.meta}>{member.relationLabel} · {statusText(member)}</Text>
            <Text style={styles.score}>{member.wellnessScore ? `${member.wellnessScore}/100 wellness score` : "Waiting for first check-in"}</Text>
          </View>
          {member.role !== "owner" && member.status !== "paused" ? (
            <Pressable disabled={saving} onPress={() => onPause(member.id)} style={styles.pauseButton}>
              <PauseCircle size={17} color={colors.warning} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  avatarText: { fontSize: 24 },
  copy: { flex: 1 },
  name: { color: colors.text, fontSize: 16, fontWeight: "900" },
  meta: { marginTop: 2, color: colors.primary, fontSize: 12, fontWeight: "900" },
  score: { marginTop: 4, color: colors.mutedText, fontSize: 12, fontWeight: "700" },
  pauseButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
});
