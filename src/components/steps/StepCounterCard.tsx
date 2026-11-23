import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useStepCounter } from "../../hooks/useStepCounter";
import { premiumPalette, premiumShadow } from "../../theme/premium";

export function StepCounterCard({ onRefresh }: { onRefresh?: () => Promise<unknown> }) {
  const data = useStepCounter();

  const needsPermission =
    data.supported === true && data.permission !== "granted";

  const percent = Math.round(data.progress * 100);
  const progressWidth = `${Math.min(100, Math.max(0, percent))}%` as `${number}%`;

  async function open() {
    if (needsPermission) {
      await data.requestPermission();
      return;
    }

    if (onRefresh) {
      await onRefresh();
      return;
    }

    router.push("/steps" as never);
  }

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${data.steps} steps out of ${data.goal}. ${onRefresh ? "Tap to refresh" : "Tap to open steps"}`}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={["#031D17", "#064B38", "#0B7A57", "#11A872"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>
              VIORA MOVEMENT INTELLIGENCE
            </Text>
            <Text style={styles.heading}>Today&apos;s rhythm</Text>
          </View>

          <View style={styles.livePill}>
            <View style={[styles.dot, data.active && styles.dotActive]} />
            <Text style={styles.liveText}>
              {data.loading
                ? "STARTING"
                : needsPermission
                  ? "ENABLE"
                  : data.active
                    ? "LIVE"
                    : "READY"}
            </Text>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.dialOuter}>
            <LinearGradient
              colors={["#DFF89A", "#8FE66C", "#40D39A"]}
              style={styles.dialGradient}
            >
              <View style={styles.dialInner}>
                <Ionicons
                  name="footsteps"
                  size={24}
                  color={premiumPalette.lime}
                />
                <Text style={styles.percent}>{percent}%</Text>
                <Text style={styles.goalLabel}>GOAL</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.countColumn}>
            <Text style={styles.steps}>
              {data.steps.toLocaleString()}
            </Text>
            <Text style={styles.goal}>
              of {data.goal.toLocaleString()} steps
            </Text>

            <View style={styles.insightPill}>
              <Ionicons
                name="sparkles"
                size={13}
                color={premiumPalette.lime}
              />
              <Text style={styles.insight}>
                {percent >= 100
                  ? "Goal complete"
                  : percent >= 70
                    ? "Strong finish"
                    : percent >= 35
                      ? "Momentum building"
                      : "Start with a short walk"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressTitle}>DAILY PROGRESS</Text>
            <Text style={styles.progressValue}>{percent}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <LinearGradient
              colors={["#DFF89A", "#8FE66C", "#40D39A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </View>

        <View style={styles.rail}>
          <Metric
            icon="navigate-outline"
            value={`${data.distanceKm}`}
            unit="KM"
          />
          <View style={styles.divider} />
          <Metric
            icon="flame-outline"
            value={`${data.calories}`}
            unit="KCAL"
          />
          <View style={styles.divider} />
          <Metric
            icon="flag-outline"
            value={Math.max(0, data.goal - data.steps).toLocaleString()}
            unit="LEFT"
          />
        </View>

        {needsPermission ? (
          <View style={styles.permissionBanner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={premiumPalette.lime}
            />
            <Text style={styles.permission}>
              Tap to allow Physical Activity access.
            </Text>
          </View>
        ) : data.supported === false ? (
          <Text style={styles.unsupported}>
            Step sensor is unavailable on this device.
          </Text>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

function Metric({
  icon,
  value,
  unit,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={17} color={premiumPalette.mint} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 31,
    ...premiumShadow.hero,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.994 }],
  },
  card: {
    minHeight: 418,
    borderRadius: 31,
    padding: 22,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 999,
    top: -155,
    right: -95,
    backgroundColor: "rgba(215,245,139,0.10)",
  },
  glowBottom: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    bottom: -155,
    left: -90,
    backgroundColor: "rgba(64,211,154,0.10)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headingCopy: {
    flex: 1,
  },
  eyebrow: {
    color: premiumPalette.lime,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  heading: {
    marginTop: 4,
    color: premiumPalette.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    backgroundColor: premiumPalette.lime,
  },
  liveText: {
    color: premiumPalette.white,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  main: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  dialOuter: {
    width: 144,
    height: 144,
    borderRadius: 72,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dialGradient: {
    flex: 1,
    borderRadius: 999,
    padding: 8,
  },
  dialInner: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#073E30",
  },
  percent: {
    marginTop: 3,
    color: premiumPalette.white,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  goalLabel: {
    marginTop: 1,
    color: "rgba(255,255,255,0.45)",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  countColumn: {
    flex: 1,
  },
  steps: {
    color: premiumPalette.white,
    fontSize: 39,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -1.6,
  },
  goal: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "700",
  },
  insightPill: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(215,245,139,0.10)",
  },
  insight: {
    color: premiumPalette.mint,
    fontSize: 9,
    fontWeight: "900",
  },
  progressBlock: {
    marginTop: 23,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  progressValue: {
    color: premiumPalette.mint,
    fontSize: 10,
    fontWeight: "900",
  },
  progressTrack: {
    marginTop: 9,
    height: 9,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  rail: {
    marginTop: 22,
    minHeight: 84,
    borderRadius: 21,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    marginTop: 4,
    color: premiumPalette.white,
    fontSize: 15,
    fontWeight: "900",
  },
  metricUnit: {
    marginTop: 2,
    color: "rgba(255,255,255,0.44)",
    fontSize: 7,
    fontWeight: "900",
  },
  divider: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  permissionBanner: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(215,245,139,0.09)",
  },
  permission: {
    color: premiumPalette.lime,
    fontSize: 10,
    fontWeight: "800",
  },
  unsupported: {
    marginTop: 13,
    color: premiumPalette.coral,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
});
