import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton, Screen } from "../components/common";
import { PremiumEntryHero } from "../components/firstImpression";
import { login } from "../services/authService";
import { colors, radius, spacing } from "../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;
    try {
      if (!email.trim()) return Alert.alert("Email required", "Please enter your email address.");
      if (!password.trim()) return Alert.alert("Password required", "Please enter your password.");
      setLoading(true);
      const credential = await login(email, password);
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase/firebaseConfig");
      const { COLLECTIONS } = await import("../firebase/firestoreCollections");
      const userSnap = await getDoc(doc(db, COLLECTIONS.users, credential.user.uid));
      router.replace(userSnap.exists() && userSnap.data()?.onboardingCompleted ? "/(tabs)" : "/onboarding");
    } catch (error: any) {
      Alert.alert("Login Failed", error?.message || "Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.text} /></Pressable>
            <PremiumEntryHero compact eyebrow="Welcome back" title="Continue your wellness rhythm." subtitle="Your goals, insights and daily plan are ready when you are." />
            <View style={styles.formCard}>
              <View style={styles.fieldGroup}><Text style={styles.label}>Email address</Text><View style={styles.inputWrap}><Ionicons name="mail-outline" size={19} color={colors.mutedText} /><TextInput placeholder="name@example.com" placeholderTextColor={colors.mutedText} style={styles.input} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail} editable={!loading} /></View></View>
              <View style={styles.fieldGroup}><Text style={styles.label}>Password</Text><View style={styles.inputWrap}><Ionicons name="lock-closed-outline" size={19} color={colors.mutedText} /><TextInput placeholder="Enter your password" placeholderTextColor={colors.mutedText} secureTextEntry={!showPassword} style={styles.input} value={password} onChangeText={setPassword} editable={!loading} returnKeyType="done" onSubmitEditing={handleLogin} /><Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={12}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={colors.mutedText} /></Pressable></View></View>
              <PrimaryButton title="Login securely" loadingTitle="Logging in..." loading={loading} disabled={loading} onPress={handleLogin} />
              <Pressable disabled={loading} onPress={() => router.push("/signup")}><Text style={styles.signupText}>New to Viora? <Text style={styles.signupAccent}>Create account</Text></Text></Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, keyboard: { flex: 1 }, container: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 48, gap: spacing.lg },
  back: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  formCard: { backgroundColor: colors.white, borderRadius: 30, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.lg },
  fieldGroup: { gap: 8 }, label: { color: colors.text, fontSize: 13, fontWeight: "900" },
  inputWrap: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F8FBF9", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  input: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "700", paddingVertical: 15 },
  signupText: { textAlign: "center", color: colors.mutedText, fontSize: 13, fontWeight: "700" }, signupAccent: { color: colors.primary, fontWeight: "900" },
});
