import { Save } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Gender, UserDoc, WellnessGoal } from "../../firebase/firestoreTypes";
import { colors, radius, spacing } from "../../theme";

const GOALS: WellnessGoal[] = [
  "Lose Weight",
  "Stay Active",
  "Improve Sleep",
  "Stress Relief",
  "Healthy Lifestyle",
];

const STRESS_LEVELS: NonNullable<UserDoc["stressLevel"]>[] = [
  "Low",
  "Moderate",
  "High",
  "Very High",
];

const GENDERS: Gender[] = ["Male", "Female", "Other"];

type Props = {
  fullName: string;
  mobile: string;
  email: string;
  gender: "" | Gender;
  age: string;
  goal: WellnessGoal;
  stressLevel: NonNullable<UserDoc["stressLevel"]>;
  saving: boolean;

  onNameChange: (v: string) => void;
  onMobileChange: (v: string) => void;
  onGenderChange: (v: "" | Gender) => void;
  onAgeChange: (v: string) => void;
  onGoalChange: (v: WellnessGoal) => void;
  onStressChange: (v: NonNullable<UserDoc["stressLevel"]>) => void;

  onSave: () => void;
};

export function ProfileEditCard(props: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        value={props.fullName}
        onChangeText={props.onNameChange}
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={colors.mutedText}
      />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        value={props.mobile}
        onChangeText={props.onMobileChange}
        keyboardType="phone-pad"
        maxLength={10}
        style={styles.input}
        placeholder="Mobile Number"
        placeholderTextColor={colors.mutedText}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        value={props.age}
        onChangeText={props.onAgeChange}
        keyboardType="number-pad"
        maxLength={3}
        style={styles.input}
        placeholder="Age"
        placeholderTextColor={colors.mutedText}
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chips}>
        {GENDERS.map((item) => (
          <Pressable
            key={item}
            onPress={() => props.onGenderChange(item)}
            style={[styles.chip, props.gender === item && styles.activeChip]}
          >
            <Text style={[styles.chipText, props.gender === item && styles.activeChipText]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Email</Text>
      <View style={styles.readonly}>
        <Text style={styles.readonlyText}>{props.email}</Text>
      </View>

      <Text style={styles.helper}>Email update will require verification.</Text>

      <Text style={styles.label}>Goal</Text>
      <View style={styles.chips}>
        {GOALS.map((item) => (
          <Pressable
            key={item}
            onPress={() => props.onGoalChange(item)}
            style={[styles.chip, props.goal === item && styles.activeChip]}
          >
            <Text style={[styles.chipText, props.goal === item && styles.activeChipText]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Stress Level</Text>
      <View style={styles.chips}>
        {STRESS_LEVELS.map((item) => (
          <Pressable
            key={item}
            onPress={() => props.onStressChange(item)}
            style={[styles.chip, props.stressLevel === item && styles.activeChip]}
          >
            <Text style={[styles.chipText, props.stressLevel === item && styles.activeChipText]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable disabled={props.saving} onPress={props.onSave} style={styles.button}>
        {props.saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Save size={18} color={colors.white} />
        )}
        <Text style={styles.buttonText}>{props.saving ? "Saving..." : "Save Profile"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  label: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontWeight: "700",
  },
  readonly: {
    backgroundColor: "#F1F5F9",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  readonlyText: {
    color: colors.mutedText,
    fontWeight: "700",
  },
  helper: {
    color: colors.mutedText,
    fontSize: 12,
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "900",
  },
  activeChipText: {
    color: colors.white,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "900",
  },
});
