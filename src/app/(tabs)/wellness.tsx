import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard, Screen, SectionHeader } from "../../components/common";
import { colors, spacing, typography } from "../../theme";

const wellnessCategories = [
  { icon: "🏠", title: "Home Fitness", text: "No equipment workouts for busy days." },
  { icon: "🧘", title: "Yoga", text: "Morning, office, stress relief and sleep yoga." },
  { icon: "😌", title: "Meditation", text: "Calm your mind with guided sessions." },
  { icon: "🎵", title: "Sound Therapy", text: "Rain, ocean, forest and sleep sounds." },
  { icon: "💼", title: "Office Wellness", text: "Eye, neck, wrist and chair stretch routines." },
  { icon: "🚶", title: "Walking", text: "Daily steps, walking goals and challenges." },
];

export default function WellnessScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          label="Explore"
          title="Wellness Library"
          subtitle="Pick what fits your day. Viora will help you stay consistent."
        />

        <View style={styles.grid}>
          {wellnessCategories.map((item) => (
            <AppCard key={item.title}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 40,
  },
  grid: {
    gap: spacing.md,
  },
  icon: {
    fontSize: 34,
  },
  cardTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  cardText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});