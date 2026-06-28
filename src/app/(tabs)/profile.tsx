import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <LinearGradient colors={["#F8FCFA", "#EEF9F3", "#FFFFFF"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Manage family members, subscription, invoices, certificates and settings.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  icon: { fontSize: 54 },
  title: { marginTop: 18, fontSize: 34, fontWeight: "900", color: "#10231C" },
  text: { marginTop: 12, fontSize: 16, color: "#6B7C73", lineHeight: 24 },
});