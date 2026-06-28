import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStep = steps[stepIndex];

  const selectedValue = answers[currentStep.key] || "";

  const canContinue = useMemo(() => {
    return selectedValue.trim().length > 0;
  }, [selectedValue]);

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
      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const userRef = doc(db, COLLECTIONS.users, currentUser.uid);

      await updateDoc(userRef, {
        fullName: answers.name || "Viora User",

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

        updatedAt: serverTimestamp(),
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("Onboarding error:", error);
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
      colors={["#F8FCFA", "#EEF9F3", "#FFFFFF"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.stepText}>
            Step {stepIndex + 1} of {steps.length}
          </Text>
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
              {stepIndex === steps.length - 1 ? "Enter Viora" : "Continue"}
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
    paddingTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backText: {
    color: "#0B6E4F",
    fontWeight: "800",
    fontSize: 15,
  },
  stepText: {
    color: "#6B7C73",
    fontWeight: "700",
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#DDEBE3",
    marginHorizontal: 24,
    marginTop: 18,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0B6E4F",
    borderRadius: 999,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 42,
  },
  title: {
    fontSize: 33,
    fontWeight: "900",
    color: "#10231C",
    lineHeight: 41,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7C73",
    lineHeight: 24,
  },
  optionsWrap: {
    marginTop: 34,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E3ECE7",
  },
  optionCardSelected: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },
  optionText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#10231C",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    marginTop: 34,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDEBE3",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 17,
    fontWeight: "700",
    color: "#10231C",
  },
  bottom: {
    padding: 24,
  },
  button: {
    backgroundColor: "#0B6E4F",
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
});