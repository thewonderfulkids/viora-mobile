import { Link2, ListTree, Target } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  childTargets,
  MEDIA_ROLES,
  parentTargetsForCategory,
} from "../../constants/contentMappingCatalog";
import { colors, radius, spacing } from "../../theme";
import { AdminContentInput, AdminMediaRole } from "../../types";

type Props = {
  draft: AdminContentInput;
  onChange: (draft: AdminContentInput) => void;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ExactContentMappingPanel({ draft, onChange }: Props) {
  const parents = parentTargetsForCategory(draft.category);
  const selectedParentId = draft.parentTargetId ||
    (["program", "session", "playlist"].includes(draft.mappingTargetType || "")
      ? draft.targetId || ""
      : "");
  const children = selectedParentId
    ? childTargets(draft.category, selectedParentId)
    : [];

  function selectParent(id: string, targetType: AdminContentInput["mappingTargetType"]) {
    onChange({
      ...draft,
      parentTargetId: "",
      targetId: id,
      mappingTargetType: targetType,
      mediaRole:
        draft.category === "music" ? "audio_track" : "full_session_video",
    });
  }

  function selectChild(id: string, targetType: AdminContentInput["mappingTargetType"]) {
    onChange({
      ...draft,
      parentTargetId: selectedParentId,
      targetId: id,
      mappingTargetType: targetType,
      mediaRole:
        draft.category === "music" ? "audio_track" : "exercise_video",
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Link2 size={20} color={colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Exact Content Mapping</Text>
          <Text style={styles.subtitle}>
            Bind this file to the exact Start/Play button, session, exercise,
            yoga pose or music track.
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Program / Session / Track</Text>
      <View style={styles.row}>
        {parents.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            active={draft.targetId === item.id && !draft.parentTargetId}
            onPress={() => selectParent(item.id, item.targetType)}
          />
        ))}
      </View>

      <TextInput
        value={!draft.parentTargetId ? draft.targetId || "" : draft.parentTargetId}
        onChangeText={(value) =>
          onChange({
            ...draft,
            parentTargetId: "",
            targetId: value.trim().toLowerCase().replace(/\s+/g, "-"),
            mappingTargetType: "program",
          })
        }
        placeholder="Or enter permanent program/session/track ID"
        placeholderTextColor={colors.mutedText}
        autoCapitalize="none"
        style={styles.input}
      />

      {children.length > 0 || selectedParentId ? (
        <>
          <Text style={styles.label}>Exercise / Pose</Text>
          <View style={styles.row}>
            {children.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                active={draft.targetId === item.id && draft.parentTargetId === item.parentId}
                onPress={() => selectChild(item.id, item.targetType)}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.manualChild}>
        <ListTree size={18} color={colors.primary} />
        <TextInput
          value={draft.parentTargetId ? draft.targetId || "" : ""}
          onChangeText={(value) => {
            const parentId = selectedParentId;
            onChange({
              ...draft,
              parentTargetId: parentId,
              targetId: value.trim().toLowerCase().replace(/\s+/g, "-"),
              mappingTargetType:
                draft.category === "yoga" ? "pose" : "exercise",
              mediaRole: "exercise_video",
            });
          }}
          placeholder="Optional exact exercise/pose ID"
          placeholderTextColor={colors.mutedText}
          autoCapitalize="none"
          style={styles.manualInput}
        />
      </View>

      <Text style={styles.label}>Media Role</Text>
      <View style={styles.row}>
        {MEDIA_ROLES.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            active={draft.mediaRole === item.id}
            onPress={() =>
              onChange({ ...draft, mediaRole: item.id as AdminMediaRole })
            }
          />
        ))}
      </View>

      <View style={styles.summary}>
        <Target size={18} color={colors.primary} />
        <Text style={styles.summaryText}>
          Binding: {draft.category} →{" "}
          {draft.parentTargetId ? `${draft.parentTargetId} → ` : ""}
          {draft.targetId || "not selected"} →{" "}
          {draft.mediaRole || "not selected"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: "#F4FBF7",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: "900" },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  label: { color: colors.text, fontSize: 12, fontWeight: "900" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: { color: colors.text, fontSize: 10, fontWeight: "900" },
  chipTextActive: { color: colors.white },
  input: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  manualChild: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  manualInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  summary: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
});
