import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommonBackButton, Screen } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { createAndLoginDefaultAdmin } from "../services/admin";
import { premiumPalette, premiumShadow } from "../theme/premium";

type SetupState = "idle" | "creating" | "success" | "error";

export default function AdminBootstrapScreen() {
  const { refreshUserDoc } = useAuth();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<SetupState>("idle");
  const [message, setMessage] = useState(
    "Tap the button once. Account creation can take up to one minute.",
  );

  async function createAdmin() {
    if (loading) return;

    setLoading(true);
    setState("creating");
    setMessage(
      "Creating Firebase user, assigning Super Admin claims and signing in...",
    );

    try {
      const result = await createAndLoginDefaultAdmin();
      await refreshUserDoc();

      setState("success");
      setMessage(
        `${result.email} was created and signed in successfully.`,
      );

      Alert.alert(
        "Super Admin ready",
        `Email: ${result.email}\nTemporary password: ${result.temporaryPassword}\n\nChange this password immediately.`,
        [
          {
            text: "Open Admin Panel",
            onPress: () => router.replace("/admin"),
          },
        ],
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";

      setState("error");
      setMessage(errorMessage);
      Alert.alert("Admin creation failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CommonBackButton />

          <View style={styles.hero}>
            <View style={styles.glow} />
            <View style={styles.iconWrap}>
              <Ionicons
                name="shield-checkmark"
                size={33}
                color={premiumPalette.lime}
              />
            </View>

            <Text style={styles.eyebrow}>ONE-TIME SECURE CREATION</Text>
            <Text style={styles.title}>
              Create Viora&apos;s default Super Admin.
            </Text>
            <Text style={styles.subtitle}>
              This creates a new Firebase account, assigns secure claims and
              permanently locks the seeder after success.
            </Text>
          </View>

          <View style={styles.credentialsCard}>
            <Text style={styles.label}>DEFAULT ADMIN EMAIL</Text>
            <Text selectable style={styles.email}>
              viora.admin@winflyindia.in
            </Text>

            <View style={styles.divider} />

            <Text style={styles.label}>TEMPORARY PASSWORD</Text>
            <Text selectable style={styles.password}>
              Viora@Admin#2026
            </Text>

            <Text style={styles.note}>
              This temporary password is stored in Firebase Secret V2. Change it
              immediately after first login.
            </Text>
          </View>

          <View
            style={[
              styles.statusCard,
              state === "success" && styles.statusSuccess,
              state === "error" && styles.statusError,
            ]}
          >
            <Ionicons
              name={
                state === "success"
                  ? "checkmark-circle"
                  : state === "error"
                    ? "alert-circle"
                    : state === "creating"
                      ? "hourglass-outline"
                      : "information-circle-outline"
              }
              size={23}
              color={
                state === "error"
                  ? premiumPalette.coral
                  : state === "success"
                    ? premiumPalette.emerald
                    : premiumPalette.sky
              }
            />
            <Text style={styles.statusText}>{message}</Text>
          </View>

          <Pressable
            onPress={createAdmin}
            disabled={loading || state === "success"}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              (loading || state === "success") && styles.disabled,
            ]}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "person-add"}
              size={20}
              color={premiumPalette.white}
            />
            <Text style={styles.buttonText}>
              {loading
                ? "Creating Super Admin..."
                : state === "success"
                  ? "Super Admin Created"
                  : "Create Default Super Admin"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 18,
  },
  hero: {
    minHeight: 330,
    borderRadius: 31,
    padding: 24,
    overflow: "hidden",
    backgroundColor: premiumPalette.forest,
    ...premiumShadow.hero,
  },
  glow: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 999,
    top: -120,
    right: -90,
    backgroundColor: "rgba(215,245,139,0.10)",
  },
  iconWrap: {
    width: 59,
    height: 59,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  eyebrow: {
    marginTop: 27,
    color: premiumPalette.lime,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 7,
    color: premiumPalette.white,
    fontSize: 33,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  credentialsCard: {
    borderRadius: 25,
    padding: 20,
    backgroundColor: premiumPalette.white,
    borderWidth: 1,
    borderColor: premiumPalette.line,
    ...premiumShadow.card,
  },
  label: {
    color: premiumPalette.emerald,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  email: {
    marginTop: 8,
    color: premiumPalette.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  password: {
    marginTop: 8,
    color: premiumPalette.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  divider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: premiumPalette.line,
  },
  note: {
    marginTop: 14,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },
  statusCard: {
    minHeight: 78,
    borderRadius: 21,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: "#EDF8FD",
    borderWidth: 1,
    borderColor: "rgba(121,201,242,0.25)",
  },
  statusSuccess: {
    backgroundColor: "#ECF9F1",
    borderColor: "rgba(11,122,87,0.20)",
  },
  statusError: {
    backgroundColor: "#FFF1EF",
    borderColor: "rgba(239,119,103,0.22)",
  },
  statusText: {
    flex: 1,
    color: premiumPalette.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
  },
  button: {
    minHeight: 59,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: premiumPalette.emerald,
  },
  buttonText: {
    color: premiumPalette.white,
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.994 }],
  },
  disabled: { opacity: 0.6 },
});
