import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { premiumPalette } from "../../theme/premium";

export function PremiumSectionHeader({
  eyebrow,
  title,
  subtitle,
  onPress,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onPress ? (
        <Pressable onPress={onPress} style={styles.button}>
          <ArrowRight size={18} color={premiumPalette.emerald} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 14 },
  copy: { flex: 1 },
  eyebrow: { color: premiumPalette.emerald, fontSize: 10, fontWeight: "900", letterSpacing: 1.25 },
  title: { marginTop: 4, color: premiumPalette.ink, fontSize: 23, lineHeight: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { marginTop: 5, color: premiumPalette.inkMuted, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  button: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: premiumPalette.mintSoft },
});
