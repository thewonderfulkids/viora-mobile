import { LinearGradient } from "expo-linear-gradient";
import { Flame, Waves } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme";

type Props = {
  minutes: number;
  sessions: number;
};

export default function YogaProgressCard({ minutes, sessions }: Props) {
  const percentage = Math.min(Math.round((minutes / 30) * 100), 100);

  return (
    <LinearGradient
      colors={["#0F766E", "#14B8A6", "#5EEAD4"]}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Waves size={22} color="#0F766E" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Today's Movement</Text>
          <Text style={styles.subtitle}>
            {minutes} min • {sessions} session{sessions === 1 ? "" : "s"}
          </Text>
        </View>

        <Flame size={22} color="#FFFFFF" />
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
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
    color: "#CCFBF1",
    fontWeight: "700",
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