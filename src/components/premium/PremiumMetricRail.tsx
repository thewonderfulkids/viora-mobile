import { Activity, Droplets, MoonStar, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { DashboardTrendMetric } from "../../types/dashboardIntelligence";
import { premiumPalette, premiumShadow } from "../../theme/premium";

const icons = [Droplets, MoonStar, Activity, Sparkles];
const accents = [premiumPalette.sky, "#A997F7", premiumPalette.coral, premiumPalette.amber];

export function PremiumMetricRail({ trends }: { trends: DashboardTrendMetric[] }) {
  return (
    <View style={styles.rail}>
      {trends.slice(0, 4).map((trend, index) => {
        const Icon = icons[index % icons.length];
        const accent = accents[index % accents.length];
        return (
          <View key={trend.id} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: `${accent}26` }]}>
              <Icon size={17} color={accent} />
            </View>
            <Text style={styles.value} numberOfLines={1}>{trend.value}</Text>
            <Text style={styles.label} numberOfLines={1}>{trend.label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(4, trend.progress)}%`, backgroundColor: accent }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { flexDirection: "row", gap: 10 },
  card: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderRadius: 21,
    backgroundColor: premiumPalette.glass,
    borderWidth: 1,
    borderColor: premiumPalette.line,
    ...premiumShadow.card,
  },
  icon: { width: 34, height: 34, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  value: { color: premiumPalette.ink, fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  label: { marginTop: 2, color: premiumPalette.inkMuted, fontSize: 10, fontWeight: "800" },
  track: { marginTop: 9, height: 5, borderRadius: 999, backgroundColor: premiumPalette.mintSoft, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
