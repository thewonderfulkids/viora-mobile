import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton, Screen } from "../components/common";
import { PremiumEntryHero } from "../components/firstImpression";
import { Gender } from "../firebase/firestoreTypes";
import { register } from "../services/authService";
import { colors, radius, spacing } from "../theme";

const GENDER_OPTIONS: Gender[] = ["Male", "Female", "Other"];

function cleanMobile(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (loading) return;

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = cleanMobile(mobile);
      const numericAge = Number(age);

      if (!cleanName) {
        Alert.alert("Name Required", "Please enter your name.");
        return;
      }

      if (!cleanEmail) {
        Alert.alert("Email Required", "Please enter your email address.");
        return;
      }

      if (cleanPhone.length !== 10) {
        Alert.alert("Mobile Required", "Please enter a valid 10 digit mobile number.");
        return;
      }

      if (!gender) {
        Alert.alert("Gender Required", "Please select your gender.");
        return;
      }

      if (!Number.isFinite(numericAge) || numericAge < 13 || numericAge > 100) {
        Alert.alert("Age Required", "Please enter a valid age between 13 and 100.");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Weak Password", "Password should be at least 6 characters.");
        return;
      }

      if (!acceptedTerms) {
        Alert.alert("Consent Required", "Please accept the Terms & Conditions to continue.");
        return;
      }

      setLoading(true);

      await register({
        fullName: cleanName,
        email: cleanEmail,
        mobile: cleanPhone,
        gender,
        age: numericAge,
        password,
      });

      router.replace("/onboarding");
    } catch (error: any) {
      Alert.alert("Signup Failed", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
          >
            <PremiumEntryHero
              compact
              eyebrow="Create your account"
              title="Build a plan that fits your real life."
              subtitle="Tell Viora the essentials now. Your deeper wellness plan comes next."
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={colors.mutedText}
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor={colors.mutedText}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                placeholder="10 digit mobile number"
                placeholderTextColor={colors.mutedText}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={(value) => setMobile(cleanMobile(value))}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.rowItem]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  placeholder="Age"
                  placeholderTextColor={colors.mutedText}
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={age}
                  onChangeText={(value) => setAge(value.replace(/\D/g, "").slice(0, 3))}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.chips}>
                {GENDER_OPTIONS.map((item) => (
                  <Pressable
                    key={item}
                    disabled={loading}
                    onPress={() => setGender(item)}
                    style={[styles.chip, gender === item && styles.activeChip]}
                  >
                    <Text style={[styles.chipText, gender === item && styles.activeChipText]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={12}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.mutedText}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              disabled={loading}
              onPress={() => setAcceptedTerms((prev) => !prev)}
              style={styles.consentRow}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                {acceptedTerms ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
              </View>
              <Text style={styles.consentText}>
                I agree to Viora Terms & Conditions and Privacy Policy.
              </Text>
            </Pressable>

            <PrimaryButton
              title="Create my account"
              loadingTitle="Creating account..."
              loading={loading}
              disabled={loading}
              onPress={handleSignup}
            />

            <Text style={styles.loginText} onPress={() => !loading && router.push("/login")}>
              Already have an account? Sign in
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
    paddingBottom: 64,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#F8FBF9",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBF9",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  eyeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "900",
  },
  activeChipText: {
    color: colors.white,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
  },
  loginText: {
    marginTop: 22,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "900",
  },
});
