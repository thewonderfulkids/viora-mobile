import { CheckCircle2, ShieldCheck, UserPlus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { FamilyInviteInput, FamilyMemberRole, FamilyPermissionKey } from "../../types";

type Props = {
  canInviteMore: boolean;
  remainingSlots: number;
  saving: boolean;
  onInvite: (input: FamilyInviteInput) => void;
};

const roles: Exclude<FamilyMemberRole, "owner">[] = ["spouse", "child", "parent", "member"];

const permissionOptions: { key: FamilyPermissionKey; label: string }[] = [
  { key: "view_dashboard", label: "Dashboard" },
  { key: "view_reports", label: "Reports" },
  { key: "view_mood", label: "Mood" },
  { key: "view_nutrition", label: "Nutrition" },
  { key: "manage_reminders", label: "Reminders" },
];

function normalizeContact(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { email: undefined, phone: undefined };

  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase(), phone: undefined };
  }

  return { email: undefined, phone: trimmed.replace(/\s+/g, "") };
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function FamilyInviteCard({ canInviteMore, remainingSlots, saving, onInvite }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<Exclude<FamilyMemberRole, "owner">>("member");
  const [permissions, setPermissions] = useState<FamilyPermissionKey[]>(["view_dashboard", "view_reports", "manage_reminders"]);

  const cleanedName = displayName.trim();
  const canSubmit = canInviteMore && !saving && cleanedName.length >= 2;

  const helperText = useMemo(() => {
    if (!canInviteMore) return "All family setup slots are currently used.";
    if (!cleanedName) return "Add a name to create a pending family invitation.";
    return `${remainingSlots} setup slot${remainingSlots === 1 ? "" : "s"} available. Invite will be saved as pending.`;
  }, [canInviteMore, cleanedName, remainingSlots]);

  function togglePermission(permission: FamilyPermissionKey) {
    setPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((item) => item !== permission);
      }
      return [...current, permission];
    });
  }

  function submit() {
    if (!canSubmit) return;

    const contactPayload = normalizeContact(contact);
    onInvite({
      displayName: cleanedName,
      email: contactPayload.email,
      phone: contactPayload.phone,
      role,
      relationLabel: titleCase(role),
      permissions,
    });
    setDisplayName("");
    setContact("");
    setRole("member");
    setPermissions(["view_dashboard", "view_reports", "manage_reminders"]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconShell}>
          <UserPlus size={20} color={colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Invite Family Member</Text>
          <Text style={styles.subtitle}>{helperText}</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Member name</Text>
        <TextInput
          editable={!saving && canInviteMore}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Example: Simmi Goel"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Email or mobile</Text>
        <TextInput
          editable={!saving && canInviteMore}
          value={contact}
          onChangeText={setContact}
          placeholder="Email or phone optional"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Relationship</Text>
        <View style={styles.roleRow}>
          {roles.map((item) => (
            <Pressable key={item} disabled={saving || !canInviteMore} onPress={() => setRole(item)} style={[styles.roleChip, role === item && styles.activeRole]}>
              <Text style={[styles.roleText, role === item && styles.activeRoleText]}>{titleCase(item)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.permissionsCard}>
        <View style={styles.permissionsHeader}>
          <ShieldCheck size={17} color={colors.primary} />
          <Text style={styles.permissionsTitle}>Shared permissions</Text>
        </View>
        <View style={styles.permissionGrid}>
          {permissionOptions.map((item) => {
            const selected = permissions.includes(item.key);
            return (
              <Pressable key={item.key} disabled={saving || !canInviteMore} onPress={() => togglePermission(item.key)} style={[styles.permissionChip, selected && styles.activePermission]}>
                {selected ? <CheckCircle2 size={14} color={colors.primaryDark} /> : null}
                <Text style={[styles.permissionText, selected && styles.activePermissionText]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable disabled={!canSubmit} onPress={submit} style={({ pressed }) => [styles.button, pressed && styles.pressed, !canSubmit && styles.disabled]}>
        <Text style={styles.buttonText}>{saving ? "Creating invite..." : "Create Invite"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconShell: { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.softGreen },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: "900" },
  subtitle: { marginTop: 3, color: colors.mutedText, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: { color: colors.primaryDark, fontSize: 12, fontWeight: "900" },
  input: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    fontWeight: "700",
  },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  roleChip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  activeRole: { backgroundColor: colors.softGreen, borderColor: colors.primary },
  roleText: { color: colors.mutedText, fontSize: 12, fontWeight: "900" },
  activeRoleText: { color: colors.primaryDark },
  permissionsCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.md,
    gap: spacing.sm,
  },
  permissionsHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  permissionsTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: "900" },
  permissionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  permissionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  activePermission: { borderColor: colors.primary, backgroundColor: colors.white },
  permissionText: { color: colors.mutedText, fontSize: 11, fontWeight: "900" },
  activePermissionText: { color: colors.primaryDark },
  button: { borderRadius: radius.pill, alignItems: "center", backgroundColor: colors.primary, paddingVertical: spacing.md },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.52 },
  pressed: { opacity: 0.82 },
});
