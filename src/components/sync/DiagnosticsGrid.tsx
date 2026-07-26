import { StyleSheet, Text, View } from "react-native";

import { AppDiagnostics } from "../../types";
import { colors, radius, spacing } from "../../theme";

type DiagnosticsGridProps = {
  diagnostics: AppDiagnostics;
};

export function DiagnosticsGrid({ diagnostics }: DiagnosticsGridProps) {
  const rows = [
    ["App Version", diagnostics.appVersion],
    ["Build", diagnostics.buildNumber],
    ["Platform", diagnostics.platform],
    ["Device", diagnostics.deviceName],
    ["OS", `${diagnostics.osName} ${diagnostics.osVersion}`],
    ["Network", diagnostics.networkLabel],
    ["Last Checked", diagnostics.lastCheckedAt ? new Date(diagnostics.lastCheckedAt).toLocaleString() : "Not checked"],
  ];

  return (
    <View style={styles.card}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  value: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
});
