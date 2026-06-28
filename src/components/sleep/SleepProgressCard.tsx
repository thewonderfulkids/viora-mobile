import { LinearGradient } from "expo-linear-gradient";
import { MoonStar } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme";

type Props = {
  sleepMinutes: number;
};

export default function SleepProgressCard({
  sleepMinutes,
}: Props) {
  const hours = (sleepMinutes / 60).toFixed(1);

  const percentage = Math.min(
    Math.round((sleepMinutes / 480) * 100),
    100
  );

  return (
    <LinearGradient
      colors={["#4338CA", "#6366F1", "#818CF8"]}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MoonStar size={22} color="#4338CA" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Last Sleep</Text>
          <Text style={styles.subtitle}>
            {hours} hours
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
            {
              width: `${percentage}%`,
            },
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: "#E0E7FF",
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