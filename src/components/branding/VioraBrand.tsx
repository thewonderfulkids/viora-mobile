import { Image, ImageStyle, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type VioraBrandProps = {
  compact?: boolean;
  showTagline?: boolean;
  imageSize?: number;
  style?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function VioraBrand({
  compact = false,
  showTagline = false,
  imageSize = compact ? 54 : 72,
  style,
  nameStyle,
  imageStyle,
}: VioraBrandProps) {
  return (
    <View style={[styles.row, style]}>
      <Image
        accessibilityIgnoresInvertColors
        source={require("../../../assets/images/viora-brand-mark.png")}
        resizeMode="contain"
        style={[
          styles.image,
          {
            width: imageSize,
            height: imageSize,
            borderRadius: Math.round(imageSize * 0.24),
          },
          imageStyle,
        ]}
      />

      <View style={styles.copy}>
        <Text style={[styles.name, compact && styles.nameCompact, nameStyle]}>
          Viora
        </Text>
        <Text style={styles.powered}>BY WINFLY</Text>
        {showTagline ? (
          <Text style={styles.tagline}>
            Your Mind. Your Body. Your Companion.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  image: {
    overflow: "hidden",
  },
  copy: {
    flexShrink: 1,
  },
  name: {
    color: "#052E24",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  nameCompact: {
    fontSize: 23,
    lineHeight: 27,
  },
  powered: {
    marginTop: 1,
    color: "#5E756B",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  tagline: {
    marginTop: 4,
    color: "#6D8178",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
});
