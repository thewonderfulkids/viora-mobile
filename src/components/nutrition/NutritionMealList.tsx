import { Minus, Plus, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { NutritionEntryDoc, NutritionMealGroup } from "../../types";

type NutritionMealListProps = {
  groups: NutritionMealGroup[];
  saving: boolean;
  onIncreasePortion: (entry: NutritionEntryDoc) => void;
  onReducePortion: (entry: NutritionEntryDoc) => void;
  onDeleteEntry: (entryId: string) => void;
};

export function NutritionMealList({
  groups,
  saving,
  onIncreasePortion,
  onReducePortion,
  onDeleteEntry,
}: NutritionMealListProps) {
  return (
    <View style={styles.wrapper}>
      {groups.map((group) => (
        <View key={group.mealType} style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View style={styles.groupCopy}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.groupMeta}>
                {group.calories} kcal • {group.protein}g protein • {group.sugar}g sugar
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{group.entries.length}</Text>
            </View>
          </View>

          {group.entries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No food logged yet.</Text>
              <Text style={styles.emptyText}>Add bread, tea, dal, roti, rice, snacks or a custom food item above.</Text>
            </View>
          ) : (
            group.entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryCopy}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryMeta}>
                      Meal total: {entry.calories} kcal • {entry.protein}g protein • {entry.foodItems.length} item{entry.foodItems.length === 1 ? "" : "s"}
                    </Text>
                    {entry.notes ? <Text style={styles.notes}>{entry.notes}</Text> : null}
                  </View>

                  <View style={styles.actions}>
                    <Pressable disabled={saving} onPress={() => onReducePortion(entry)} style={styles.iconButton}>
                      <Minus size={15} color={colors.primaryDark} />
                    </Pressable>
                    <Pressable disabled={saving} onPress={() => onIncreasePortion(entry)} style={styles.iconButton}>
                      <Plus size={15} color={colors.primaryDark} />
                    </Pressable>
                    <Pressable disabled={saving} onPress={() => onDeleteEntry(entry.id)} style={[styles.iconButton, styles.deleteButton]}>
                      <Trash2 size={15} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.foodList}>
                  {entry.foodItems.map((item) => (
                    <View key={item.id} style={styles.foodRow}>
                      <View style={styles.foodCopy}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodServing}>{item.servingLabel}</Text>
                      </View>
                      <View style={styles.foodMacros}>
                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                        <Text style={styles.foodMacroLine}>{item.protein}g protein • {item.sugar}g sugar</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  groupCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  groupCopy: {
    flex: 1,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  groupMeta: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  countBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  emptyBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: 3,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  entryCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  entryHeader: {
    gap: spacing.md,
  },
  entryCopy: {
    gap: 3,
  },
  entryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  entryMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  notes: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    backgroundColor: "#FFF7F7",
  },
  foodList: {
    gap: spacing.sm,
  },
  foodRow: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  foodCopy: {
    flex: 1,
    gap: 3,
  },
  foodName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  foodServing: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  foodMacros: {
    alignItems: "flex-end",
    gap: 3,
  },
  foodCalories: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
  },
  foodMacroLine: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
});
