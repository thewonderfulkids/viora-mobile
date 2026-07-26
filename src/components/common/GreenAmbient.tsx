import { StyleSheet, View } from "react-native";

export function GreenAmbient() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.topGlow} />
      <View style={styles.midGlow} />
      <View style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  topGlow: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -190,
    right: -150,
    backgroundColor: "rgba(143, 228, 95, 0.15)",
  },
  midGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: "38%",
    left: -190,
    backgroundColor: "rgba(11, 110, 79, 0.07)",
  },
  bottomGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -210,
    right: -170,
    backgroundColor: "rgba(185, 255, 102, 0.10)",
  },
});
