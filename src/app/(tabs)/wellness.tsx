import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppCard, Screen, SectionHeader } from "../../components/common";
import { useAppTranslation } from "../../i18n/useAppTranslation";
import { colors, spacing, typography } from "../../theme";

const wellnessModules = [
  {
    icon: "💧",
    title: "wellnessHub.module0Title",
    text: "wellnessHub.module0Text",
    route: "/hydration",
    status: "Available",
  },
  {
    icon: "😴",
    title: "wellnessHub.module1Title",
    text: "wellnessHub.module1Text",
    route: "/sleep",
    status: "Available",
  },
  {
    icon: "🧘",
    title: "wellnessHub.module2Title",
    text: "wellnessHub.module2Text",
    route: "/yoga",
    status: "Available",
  },

  {
    icon: "✨",
    title: "wellnessHub.module3Title",
    text: "wellnessHub.module3Text",
    route: "/programs",
    status: "Available",
  },
  {
    icon: "💪",
    title: "wellnessHub.module4Title",
    text: "wellnessHub.module4Text",
    route: "/home-workout",
    status: "Available",
  },

  {
    icon: "🎙️",
    title: "wellnessHub.module5Title",
    text: "wellnessHub.module5Text",
    route: "/voice-ai",
    status: "Available",
  },
  {
    icon: "🤖",
    title: "wellnessHub.module6Title",
    text: "wellnessHub.module6Text",
    route: "/ai-coach",
    status: "Available",
  },
  {
    icon: "🧠",
    title: "wellnessHub.module7Title",
    text: "wellnessHub.module7Text",
    route: "/wellness-intelligence",
    status: "Available",
  },
  {
    icon: "🎯",
    title: "wellnessHub.module8Title",
    text: "wellnessHub.module8Text",
    route: "/goals-habits",
    status: "Available",
  },
  {
    icon: "😌",
    title: "wellnessHub.module9Title",
    text: "wellnessHub.module9Text",
    route: "/mental-wellness",
    status: "Available",
  },

  {
    icon: "👨‍👩‍👧‍👦",
    title: "wellnessHub.module10Title",
    text: "wellnessHub.module10Text",
    route: "/family-wellness",
    status: "Available",
  },
  {
    icon: "📄",
    title: "wellnessHub.module11Title",
    text: "wellnessHub.module11Text",
    route: "/reports",
    status: "Available",
  },
  {
    icon: "🎵",
    title: "wellnessHub.module12Title",
    text: "wellnessHub.module12Text",
    route: "/music",
    status: "Available",
  },
  {
    icon: "😌",
    title: "wellnessHub.module13Title",
    text: "wellnessHub.module13Text",
    route: "/meditation",
    status: "Available",
  },
  {
    icon: "🍎",
    title: "wellnessHub.module14Title",
    text: "wellnessHub.module14Text",
    route: "/nutrition",
    status: "Available",
  },
  {
    icon: "⌚",
    title: "wellnessHub.module15Title",
    text: "wellnessHub.module15Text",
    route: null,
    status: "Planned",
  },
];

export default function WellnessScreen() {
  const { t } = useAppTranslation();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          label={t("wellnessHub.label")}
          title={t("wellnessHub.title")}
          subtitle={t("wellnessHub.subtitle")}
        />

        <View style={styles.grid}>
          {wellnessModules.map((item) => (
            <Pressable
              key={item.title}
              disabled={!item.route}
              onPress={
                item.route ? () => router.push(item.route as any) : undefined
              }
            >
              <AppCard>
                <View style={styles.cardHeader}>
                  <Text style={styles.icon}>{item.icon}</Text>
                  <View
                    style={[
                      styles.badge,
                      item.status !== "Available" && styles.comingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.status !== "Available" && styles.comingBadgeText,
                      ]}
                    >
                      {t(item.status === "Available" ? "wellnessHub.available" : "wellnessHub.planned")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{t(item.title)}</Text>
                <Text style={styles.cardText}>{t(item.text)}</Text>
              </AppCard>
            </Pressable>
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: 34,
  },
  badge: {
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  comingBadge: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  comingBadgeText: {
    color: colors.mutedText,
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