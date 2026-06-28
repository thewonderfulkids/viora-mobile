import {
  Brain,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useWellnessIntelligence } from "../../hooks/useWellnessIntelligence";
import { colors, radius, spacing } from "../../theme";

type AIInsightCardProps = {
  title?: string;
  insight?: string;
};

function formatValue(value: string) {
  return value.replace(/_/g, " ");
}

export function AIInsightCard({ title, insight }: AIInsightCardProps) {
  const { loading, error, intelligence, refresh } = useWellnessIntelligence();

  if (title || insight) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Brain size={22} color={colors.white} />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>{title ?? "Viora AI Insight"}</Text>
            <Text style={styles.subtitle}>Personalized wellness guidance</Text>
          </View>
        </View>

        <Text style={styles.message}>
          {insight ?? "Viora is learning from your wellness activity."}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🧠 Today's AI Wellness Insight</Text>
        <Text style={styles.message}>Generating your personalized insight...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🧠 Today's AI Wellness Insight</Text>
        <Text style={styles.message}>{error}</Text>

        <Pressable onPress={refresh} style={styles.refreshButton}>
          <RefreshCw size={16} color={colors.white} />
          <Text style={styles.refreshText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!intelligence) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🧠 Today's AI Wellness Insight</Text>
        <Text style={styles.message}>
          Complete more wellness activities to receive personalized AI insights.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Brain size={22} color={colors.white} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Today's AI Wellness Insight</Text>
          <Text style={styles.subtitle}>Powered by your wellness memory</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.metric}>
          <TrendingUp size={18} color={colors.primary} />
          <Text style={styles.label}>Trend</Text>
          <Text style={styles.value}>
            {formatValue(intelligence.overallTrend)}
          </Text>
        </View>

        <View style={styles.metric}>
          <Target size={18} color={colors.primary} />
          <Text style={styles.label}>Focus</Text>
          <Text style={styles.value}>
            {formatValue(intelligence.recommendedFocus)}
          </Text>
        </View>
      </View>

      {intelligence.achievements.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement</Text>
          <Text style={styles.message}>{intelligence.achievements[0]}</Text>
        </View>
      ) : null}

      {intelligence.riskSignals.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attention</Text>
          <Text style={styles.message}>{intelligence.riskSignals[0]}</Text>
        </View>
      ) : null}

      <View style={styles.coachBox}>
        <Sparkles size={18} color={colors.primary} />
        <Text style={styles.coachText}>{intelligence.coachInsight}</Text>
      </View>

      <Pressable onPress={refresh} style={styles.refreshButton}>
        <RefreshCw size={16} color={colors.white} />
        <Text style={styles.refreshText}>Refresh AI Insight</Text>
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
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.softGreen,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  label: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
  },
  value: {
    marginTop: 2,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  section: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  message: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  coachBox: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#F5F3FF",
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  coachText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  refreshText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
});