import { Droplets } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type Props = {
  saving?: boolean;
  onAdd: (amountMl: number) => void;
  onRemove?: (amountMl: number) => void;
};

const amounts = [250, 500, 750, 1000];

export default function WaterQuickAdd({ saving, onAdd, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Quick Add</Text>

      <View style={styles.grid}>
        {amounts.map((amount) => (
          <Pressable
            key={amount}
            disabled={saving}
            onPress={() => onAdd(amount)}
            style={[styles.button, saving && styles.disabled]}
          >
            <Droplets size={18} color={colors.primary} />
            <Text style={styles.buttonText}>{amount} ml</Text>
          </Pressable>
        ))}
      </View>

      {onRemove ? (
        <>
          <Text style={styles.subHeading}>Correction</Text>

          <View style={styles.grid}>
            {[250, 500].map((amount) => (
              <Pressable
                key={`remove-${amount}`}
                disabled={saving}
                onPress={() => onRemove(amount)}
                style={[styles.removeButton, saving && styles.disabled]}
              >
                <Text style={styles.removeText}>- {amount} ml</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
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
  button: {
    width: "47%",
    backgroundColor: "#F7FBF8",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: "center",
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
  subHeading: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "900",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  removeButton: {
    width: "47%",
    backgroundColor: "#FFF7F7",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#FFD6D6",
    paddingVertical: 16,
    alignItems: "center",
  },
  removeText: {
    color: "#B42318",
    fontWeight: "900",
    fontSize: 15,
  },
});