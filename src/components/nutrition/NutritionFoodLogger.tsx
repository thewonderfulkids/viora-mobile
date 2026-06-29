import { Plus, Utensils } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { FoodPreset, FoodUnit, MealType, NutritionEntryInput, NutritionFoodItemInput } from "../../types";

type NutritionFoodLoggerProps = {
  presets: FoodPreset[];
  saving: boolean;
  onAddEntry: (entry: Omit<NutritionEntryInput, "userId">) => void;
};

const MEAL_OPTIONS: Array<{ label: string; value: MealType }> = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Snacks", value: "snack" },
];

const UNIT_OPTIONS: FoodUnit[] = ["slice", "bowl", "cup", "ml", "gram", "piece", "tsp", "tbsp", "serving"];

function numberFromText(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scalePreset(preset: FoodPreset, quantityText: string): NutritionFoodItemInput {
  const quantity = Math.max(numberFromText(quantityText, preset.defaultQuantity), 0.1);
  const multiplier = quantity / Math.max(preset.defaultQuantity, 0.1);

  return {
    name: preset.name,
    quantity,
    unit: preset.unit,
    servingLabel: `${quantity} ${preset.unit}`,
    calories: Math.round(preset.calories * multiplier),
    protein: Number((preset.protein * multiplier).toFixed(1)),
    carbs: Number((preset.carbs * multiplier).toFixed(1)),
    fat: Number((preset.fat * multiplier).toFixed(1)),
    fiber: Number((preset.fiber * multiplier).toFixed(1)),
    sugar: Number((preset.sugar * multiplier).toFixed(1)),
    sodium: Math.round(preset.sodium * multiplier),
    source: "preset",
  };
}

export function NutritionFoodLogger({ presets, saving, onAddEntry }: NutritionFoodLoggerProps) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0]?.id || "");
  const [quantity, setQuantity] = useState(String(presets[0]?.defaultQuantity || 1));
  const [customName, setCustomName] = useState("");
  const [customUnit, setCustomUnit] = useState<FoodUnit>("serving");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customSugar, setCustomSugar] = useState("");

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) || null,
    [presets, selectedPresetId]
  );

  const previewItem = selectedPreset ? scalePreset(selectedPreset, quantity) : null;

  function addPresetFood() {
    if (!previewItem) return;

    onAddEntry({
      mealType,
      title: previewItem.name,
      notes: `Added from Viora food presets: ${previewItem.servingLabel}.`,
      portionSize: previewItem.servingLabel,
      mealTime: new Date().toISOString(),
      source: "preset",
      foodItems: [previewItem],
    });
  }

  function addCustomFood() {
    const name = customName.trim();
    if (!name) return;

    const item: NutritionFoodItemInput = {
      name,
      quantity: 1,
      unit: customUnit,
      servingLabel: `1 ${customUnit}`,
      calories: Math.max(numberFromText(customCalories), 0),
      protein: Math.max(numberFromText(customProtein), 0),
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: Math.max(numberFromText(customSugar), 0),
      sodium: 0,
      source: "manual",
    };

    onAddEntry({
      mealType,
      title: name,
      notes: "Custom food item added manually.",
      portionSize: item.servingLabel,
      mealTime: new Date().toISOString(),
      source: "manual",
      foodItems: [item],
    });

    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomSugar("");
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconShell}>
          <Utensils size={18} color={colors.white} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Add Real Food Item</Text>
          <Text style={styles.subtitle}>Choose meal time, item and quantity. Calories update from the selected food item.</Text>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Meal Time</Text>
        <View style={styles.chipRow}>
          {MEAL_OPTIONS.map((option) => {
            const active = option.value === mealType;
            return (
              <Pressable key={option.value} style={[styles.chip, active && styles.activeChip]} onPress={() => setMealType(option.value)}>
                <Text style={[styles.chipText, active && styles.activeChipText]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Food Presets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
          {presets.map((preset) => {
            const active = preset.id === selectedPresetId;
            return (
              <Pressable
                key={preset.id}
                style={[styles.presetChip, active && styles.activePresetChip]}
                onPress={() => {
                  setSelectedPresetId(preset.id);
                  setQuantity(String(preset.defaultQuantity));
                }}
              >
                <Text style={[styles.presetName, active && styles.activePresetName]}>{preset.name}</Text>
                <Text style={[styles.presetMeta, active && styles.activePresetMeta]}>{preset.calories} kcal • {preset.servingLabel}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {selectedPreset && previewItem ? (
        <View style={styles.previewCard}>
          <View style={styles.inputRow}>
            <View style={styles.quantityBox}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="Qty"
                style={styles.input}
              />
            </View>
            <View style={styles.unitBox}>
              <Text style={styles.label}>Unit</Text>
              <Text style={styles.staticUnit}>{selectedPreset.unit}</Text>
            </View>
          </View>

          <Text style={styles.previewTitle}>{previewItem.name}</Text>
          <Text style={styles.previewMeta}>
            {previewItem.calories} kcal • {previewItem.protein}g protein • {previewItem.sugar}g sugar • {previewItem.sodium}mg sodium
          </Text>

          <Pressable disabled={saving} style={styles.primaryButton} onPress={addPresetFood}>
            <Plus size={15} color={colors.white} />
            <Text style={styles.primaryButtonText}>Add {selectedPreset.name}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.customCard}>
        <Text style={styles.customTitle}>Custom Food</Text>
        <TextInput value={customName} onChangeText={setCustomName} placeholder="Example: Homemade sandwich" style={styles.input} />

        <View style={styles.unitWrap}>
          {UNIT_OPTIONS.map((unit) => {
            const active = unit === customUnit;
            return (
              <Pressable key={unit} style={[styles.smallChip, active && styles.activeChip]} onPress={() => setCustomUnit(unit)}>
                <Text style={[styles.smallChipText, active && styles.activeChipText]}>{unit}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inputRow}>
          <TextInput value={customCalories} onChangeText={setCustomCalories} keyboardType="numeric" placeholder="Calories" style={[styles.input, styles.flexInput]} />
          <TextInput value={customProtein} onChangeText={setCustomProtein} keyboardType="numeric" placeholder="Protein g" style={[styles.input, styles.flexInput]} />
          <TextInput value={customSugar} onChangeText={setCustomSugar} keyboardType="numeric" placeholder="Sugar g" style={[styles.input, styles.flexInput]} />
        </View>

        <Pressable disabled={saving || !customName.trim()} style={[styles.secondaryButton, !customName.trim() && styles.disabledButton]} onPress={addCustomFood}>
          <Plus size={15} color={colors.primaryDark} />
          <Text style={styles.secondaryButtonText}>Add Custom Food</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  block: {
    gap: spacing.sm,
  },
  label: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  activeChipText: {
    color: colors.white,
  },
  presetRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  presetChip: {
    width: 160,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: 4,
  },
  activePresetChip: {
    backgroundColor: colors.softGreen,
    borderColor: colors.primary,
  },
  presetName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  activePresetName: {
    color: colors.primaryDark,
  },
  presetMeta: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  activePresetMeta: {
    color: colors.primary,
  },
  previewCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quantityBox: {
    flex: 1,
    gap: spacing.xs,
  },
  unitBox: {
    width: 92,
    gap: spacing.xs,
  },
  input: {
    minHeight: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    fontWeight: "800",
  },
  flexInput: {
    flex: 1,
  },
  staticUnit: {
    minHeight: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: "900",
  },
  previewTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  previewMeta: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  primaryButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  customCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  customTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  unitWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  smallChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  smallChipText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  secondaryButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
});
