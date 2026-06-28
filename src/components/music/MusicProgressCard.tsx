import { LinearGradient } from "expo-linear-gradient";
import { Headphones, Music4 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme";

type Props = {
  minutes: number;
};

export default function MusicProgressCard({ minutes }: Props) {
  const percentage = Math.min(Math.round((minutes / 30) * 100), 100);

  return (
    <LinearGradient
      colors={["#5B21B6", "#7C3AED", "#A78BFA"]}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Headphones size={22} color="#5B21B6" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Today's Therapy</Text>
          <Text style={styles.subtitle}>
            {minutes} min completed
          </Text>
        </View>

        <Music4 size={22} color="#FFFFFF" />
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
    width: 48,
    height: 48,
    borderRadius: 18,
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
    color: "#E9D5FF",
    fontWeight: "700",
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
});