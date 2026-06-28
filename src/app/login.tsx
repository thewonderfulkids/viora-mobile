import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton, Screen, SectionHeader } from "../components/common";
import { login } from "../services/authService";
import { colors, radius, spacing } from "../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const credential = await login(email, password);

      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase/firebaseConfig");
      const { COLLECTIONS } = await import("../firebase/firestoreCollections");

      const userRef = doc(db, COLLECTIONS.users, credential.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <SectionHeader
          label="Welcome Back"
          title="Login to Viora"
          subtitle="Continue your wellness journey."
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
        />
        <Pressable onPress={() => router.push("/signup")}>
        <Text style={styles.signupText}>New to Viora? Create Account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 18,
    fontSize: 16,
  },
    signupText: {
    marginTop: 22,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "900",
  },
});