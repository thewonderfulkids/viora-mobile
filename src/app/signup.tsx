import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton, Screen, SectionHeader } from "../components/common";
import { register } from "../services/authService";
import { colors, radius, spacing } from "../theme";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      if (!name.trim()) {
        Alert.alert("Name Required", "Please enter your name.");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Weak Password", "Password should be at least 6 characters.");
        return;
      }

      await register({
        fullName: name,
        email,
        password,
      });
      router.replace("/onboarding");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <SectionHeader
          label="Create Account"
          title="Join Viora"
          subtitle="Start your personalized wellness journey."
        />

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
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

        <PrimaryButton title="Create Account" onPress={handleSignup} />

        <Text style={styles.loginText} onPress={() => router.push("/login")}>
          Already have an account? Login
        </Text>
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
  loginText: {
    marginTop: 22,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "900",
  },
});