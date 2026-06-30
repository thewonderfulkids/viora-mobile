import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { CopingAction, MoodEmotion, MoodEntryInput, MoodLevel, MoodTrigger } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

const emotions: { label: string; value: MoodEmotion }[] = [
  { label: "Calm", value: "calm" },
  { label: "Happy", value: "happy" },
  { label: "Focused", value: "focused" },
  { label: "Tired", value: "tired" },
  { label: "Stressed", value: "stressed" },
  { label: "Anxious", value: "anxious" },
  { label: "Sad", value: "sad" },
  { label: "Overwhelmed", value: "overwhelmed" },
];

const triggers: { label: string; value: MoodTrigger }[] = [
  { label: "Work", value: "work" },
  { label: "Family", value: "family" },
  { label: "Sleep", value: "sleep" },
  { label: "Food", value: "food" },
  { label: "Money", value: "money" },
  { label: "Screen", value: "screen_time" },
];

const copingActions: { label: string; value: CopingAction }[] = [
  { label: "Breathing", value: "breathing" },
  { label: "Walk", value: "walk" },
  { label: "Journal", value: "journal" },
  { label: "Music", value: "music" },
  { label: "Yoga", value: "yoga" },
  { label: "Water", value: "water" },
];

type MoodCheckInCardProps = {
  saving: boolean;
  onSave: (input: Omit<MoodEntryInput, "userId">) => Promise<void> | void;
};

function toggleItem<T extends string>(items: T[], item: T) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

export function MoodCheckInCard({ saving, onSave }: MoodCheckInCardProps) {
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepImpact, setSleepImpact] = useState(4);
  const [selectedEmotions, setSelectedEmotions] = useState<MoodEmotion[]>(["calm"]);
  const [selectedTriggers, setSelectedTriggers] = useState<MoodTrigger[]>(["unknown"]);
  const [selectedActions, setSelectedActions] = useState<CopingAction[]>(["breathing"]);
  const [note, setNote] = useState("");

  const helperText = useMemo(() => {
    if (stressLevel >= 8) return "High stress selected. Viora will suggest a calm reset.";
    if (moodLevel >= 4 && energyLevel >= 7) return "Great rhythm. Viora will protect this pattern in AI memory.";
    return "This check-in improves AI Coach, notifications and wellness intelligence.";
  }, [energyLevel, moodLevel, stressLevel]);

  async function handleSave() {
    await onSave({
      moodLevel,
      stressLevel,
      energyLevel,
      sleepImpact,
      emotions: selectedEmotions.length > 0 ? selectedEmotions : ["calm"],
      triggers: selectedTriggers.length > 0 ? selectedTriggers : ["unknown"],
      copingActions: selectedActions,
      note,
      source: "manual",
    });
    setNote("");
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>{helperText}</Text>
      </View>

      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            key={value}
            style={[styles.moodButton, moodLevel === value && styles.selectedMoodButton]}
            onPress={() => setMoodLevel(value as MoodLevel)}
          >
            <Text style={[styles.moodText, moodLevel === value && styles.selectedMoodText]}>{value}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.fieldLabel}>Stress level: {stressLevel}/10</Text>
        <View style={styles.scaleRow}>
          {[2, 4, 6, 8, 10].map((value) => (
            <Pressable key={value} style={[styles.pill, stressLevel === value && styles.selectedPill]} onPress={() => setStressLevel(value)}>
              <Text style={[styles.pillText, stressLevel === value && styles.selectedPillText]}>{value}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.fieldLabel}>Energy level: {energyLevel}/10</Text>
        <View style={styles.scaleRow}>
          {[2, 4, 6, 8, 10].map((value) => (
            <Pressable key={value} style={[styles.pill, energyLevel === value && styles.selectedPill]} onPress={() => setEnergyLevel(value)}>
              <Text style={[styles.pillText, energyLevel === value && styles.selectedPillText]}>{value}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.fieldLabel}>Sleep impact: {sleepImpact}/10</Text>
        <View style={styles.scaleRow}>
          {[0, 2, 4, 6, 8].map((value) => (
            <Pressable key={value} style={[styles.pill, sleepImpact === value && styles.selectedPill]} onPress={() => setSleepImpact(value)}>
              <Text style={[styles.pillText, sleepImpact === value && styles.selectedPillText]}>{value}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.optionGroup}>
        <Text style={styles.fieldLabel}>Emotions</Text>
        <View style={styles.chips}>
          {emotions.map((item) => {
            const selected = selectedEmotions.includes(item.value);
            return (
              <Pressable key={item.value} style={[styles.chip, selected && styles.selectedChip]} onPress={() => setSelectedEmotions((current) => toggleItem(current, item.value))}>
                <Text style={[styles.chipText, selected && styles.selectedChipText]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.optionGroup}>
        <Text style={styles.fieldLabel}>Triggers</Text>
        <View style={styles.chips}>
          {triggers.map((item) => {
            const selected = selectedTriggers.includes(item.value);
            return (
              <Pressable key={item.value} style={[styles.chip, selected && styles.selectedChip]} onPress={() => setSelectedTriggers((current) => toggleItem(current.filter((value) => value !== "unknown"), item.value))}>
                <Text style={[styles.chipText, selected && styles.selectedChipText]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.optionGroup}>
        <Text style={styles.fieldLabel}>What helped?</Text>
        <View style={styles.chips}>
          {copingActions.map((item) => {
            const selected = selectedActions.includes(item.value);
            return (
              <Pressable key={item.value} style={[styles.chip, selected && styles.selectedChip]} onPress={() => setSelectedActions((current) => toggleItem(current, item.value))}>
                <Text style={[styles.chipText, selected && styles.selectedChipText]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Optional note: what happened today?"
        placeholderTextColor={colors.mutedText}
        multiline
        style={styles.input}
      />

      <Pressable disabled={saving} style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "Save mood check-in"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    ...typography.caption,
  },
  scaleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedMoodButton: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  moodText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "900",
  },
  selectedMoodText: {
    color: colors.white,
  },
  sliderGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  selectedPillText: {
    color: colors.white,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  selectedChip: {
    backgroundColor: colors.softGreen,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedText,
    fontWeight: "800",
    fontSize: 12,
  },
  selectedChipText: {
    color: colors.primaryDark,
  },
  input: {
    minHeight: 88,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    color: colors.text,
    textAlignVertical: "top",
    ...typography.caption,
  },
  saveButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.55,
  },
  saveText: {
    color: colors.white,
    fontWeight: "900",
  },
});
