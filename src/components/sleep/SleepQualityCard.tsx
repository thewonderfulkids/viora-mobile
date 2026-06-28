import { Star } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SleepQuality } from "../../firebase/firestoreTypes";
import { colors, radius, spacing } from "../../theme";

type Props = {
  selected: SleepQuality;
  onSelect: (quality: SleepQuality) => void;
};

const qualities: SleepQuality[] = ["Poor", "Average", "Good", "Excellent"];

export default function SleepQualityCard({ selected, onSelect }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Sleep Quality</Text>

      <View style={styles.grid}>
        {qualities.map((quality) => {
          const active = selected === quality;

          return (
            <Pressable
              key={quality}
              onPress={() => onSelect(quality)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Star
                size={17}
                color={active ? "#FFFFFF" : colors.primary}
              />

              <Text
                style={[
                  styles.optionText,
                  active && styles.optionTextActive,
                ]}
              >
                {quality}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  option: {
    width: "47%",
    backgroundColor: "#F7FBF8",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: "center",
    gap: spacing.sm,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
});