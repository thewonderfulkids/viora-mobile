import { LinearGradient } from "expo-linear-gradient";
import { Droplets } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme";

type Props = {
  currentMl: number;
  goalMl: number;
};

export default function WaterProgressCard({
  currentMl,
  goalMl,
}: Props) {
  const percentage = Math.min(
    Math.round((currentMl / goalMl) * 100),
    100
  );

  return (
    <LinearGradient
      colors={["#1C9CF0", "#38BDF8", "#7DD3FC"]}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Droplets size={22} color="#1C9CF0" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Today's Hydration</Text>
          <Text style={styles.subtitle}>
            {currentMl} ml of {goalMl} ml
          </Text>
        </View>

        <Text style={styles.percent}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%` },
          ]}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: "#E0F2FE",
    fontWeight: "700",
  },
  percent: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 22,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
});