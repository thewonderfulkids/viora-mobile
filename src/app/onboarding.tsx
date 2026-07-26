import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";

const steps = [
  {
    key: "goal",
    title: "What is your wellness goal?",
    subtitle: "We'll personalize your daily wellness journey.",
    type: "select",
    options: [
      "Lose Weight",
      "Stay Active",
      "Reduce Stress",
      "Improve Sleep",
      "Healthy Lifestyle",
    ],
  },
  {
    key: "routine",
    title: "How do you spend your day?",
    subtitle: "This helps Viora build a realistic routine.",
    type: "select",
    options: ["Office", "Work From Home", "Hybrid", "Business Owner", "Student"],
  },
  {
    key: "time",
    title: "How much time can you give daily?",
    subtitle: "No gym. No equipment. Just your routine.",
    type: "select",
    options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"],
  },
  {
    key: "stress",
    title: "How is your stress level?",
    subtitle: "Viora will add breathing, meditation and sound therapy accordingly.",
    type: "select",
    options: ["Low", "Moderate", "High", "Very High"],
  },
  {
    key: "name",
    title: "What should we call you?",
    subtitle: "Your wellness journey starts here.",
    type: "input",
    placeholder: "Enter your name",
  },
];

export default function OnboardingScreen() {
  const { refreshUserDoc } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const currentStep = steps[stepIndex];

  const selectedValue = answers[currentStep.key] || "";

  const canContinue = useMemo(() => {
    return selectedValue.trim().length > 0 && !saving;
  }, [selectedValue, saving]);

  function handleSelect(value: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.key]: value,
    }));
  }

  async function handleContinue() {
    if (!canContinue) return;

    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    try {
      setSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const userRef = doc(db, COLLECTIONS.users, currentUser.uid);

      await setDoc(
        userRef,
        {
          uid: currentUser.uid,
          email: currentUser.email || "",
          fullName: answers.name || currentUser.email?.split("@")[0] || "Viora User",

          goal:
            answers.goal === "Reduce Stress"
              ? "Stress Relief"
              : answers.goal || "Healthy Lifestyle",

          lifestyle:
            answers.routine === "Work From Home"
              ? "WFH"
              : answers.routine === "Business Owner"
              ? "Business"
              : answers.routine || "Office",

          dailyTimeCommitment: answers.time || "15 minutes",
          stressLevel: answers.stress || "Moderate",

          onboardingCompleted: true,
          aiCoachEnabled: true,
          notificationsEnabled: true,
          waterGoalMl: 2500,
          language: "en",
          country: "IN",
          timezone: "Asia/Kolkata",
          plan: "Free",
          subscriptionStatus: "Trial",
          isDeleted: false,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await refreshUserDoc();
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("Onboarding error:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (stepIndex === 0) {
      router.replace("/login");
      return;
    }

    setStepIndex((prev) => prev - 1);
  }

  return (
    <LinearGradient
      colors={["#F4FBF7", "#E9F7EF", "#FFFFFF"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} disabled={saving}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.stepText}>Your plan · {stepIndex + 1}/{steps.length}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((stepIndex + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

          {currentStep.type === "select" ? (
            <View style={styles.optionsWrap}>
              {currentStep.options?.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleSelect(option)}
                  disabled={saving}
                  style={[
                    styles.optionCard,
                    selectedValue === option && styles.optionCardSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <TextInput
              value={selectedValue}
              onChangeText={handleSelect}
              placeholder={currentStep.placeholder}
              placeholderTextColor="#8CA399"
              style={styles.input}
              editable={!saving}
            />
          )}
        </View>

        <View style={styles.bottom}>
          <Pressable
            disabled={!canContinue}
            onPress={handleContinue}
            style={[styles.button, !canContinue && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : stepIndex === steps.length - 1 ? "Enter Viora" : "Continue"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backText: {
    color: "#047857",
    fontWeight: "900",
  },
  stepText: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 12,
  },
  progressTrack: {
    marginHorizontal: 24,
    marginTop: 18,
    height: 8,
    backgroundColor: "#DDEBE3",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0B6E4F",
    borderRadius: 99,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 34,
  },
  title: {
    color: "#063B2C",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  optionsWrap: {
    marginTop: 28,
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#DDEBE3",
    padding: 20,
  },
  optionCardSelected: {
    backgroundColor: "#0B6E4F",
    borderColor: "#047857",
  },
  optionText: {
    color: "#063B2C",
    fontSize: 15,
    fontWeight: "900",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    marginTop: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#DDEBE3",
    padding: 20,
    color: "#063B2C",
    fontWeight: "800",
    fontSize: 16,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  button: {
    backgroundColor: "#0B6E4F",
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});
