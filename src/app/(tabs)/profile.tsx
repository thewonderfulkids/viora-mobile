import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";

import { Screen } from "../../components/common";
import {
  ProfileAIMemoryCard,
  ProfileEditCard,
  ProfileHero,
  ProfileSettingsList,
  ProfileSnapshotCard,
  ProfileSubscriptionCard,
} from "../../components/profile";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/firebaseConfig";
import { UserDoc, WellnessGoal } from "../../firebase/firestoreTypes";
import { useDashboard } from "../../hooks/useDashboard";
import { pickAndUploadProfilePhoto } from "../../services/user/profilePhotoService";
import { saveUserProfile } from "../../services/user/userService";
import { colors, spacing } from "../../theme";

export default function ProfileScreen() {
  const { user, refreshUserDoc } = useAuth();
  const { data, refresh } = useDashboard();

  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [goal, setGoal] = useState<WellnessGoal>("Healthy Lifestyle");
  const [stressLevel, setStressLevel] =
    useState<NonNullable<UserDoc["stressLevel"]>>("Moderate");

  const email = user?.email || "No email";

  useEffect(() => {
    setFullName(data?.user?.fullName || user?.email?.split("@")[0] || "");
    setMobile(data?.user?.mobile || "");
    setPhotoURL(data?.user?.photoURL || "");
    setGoal(data?.user?.goal || "Healthy Lifestyle");
    setStressLevel(data?.user?.stressLevel || "Moderate");
  }, [data?.user, user?.email]);

  async function handleSaveProfile() {
    if (!user) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    try {
      setSaving(true);

      await saveUserProfile({
        uid: user.uid,
        fullName,
        mobile,
        goal,
        stressLevel,
      });

      await refreshUserDoc();
      await refresh();

      Alert.alert("Profile updated", "Your profile has been saved.");
    } catch (error: any) {
      Alert.alert(
        "Unable to save profile",
        error?.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload() {
    if (!user) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    try {
      const url = await pickAndUploadProfilePhoto(user.uid);

      if (!url) return;

      setPhotoURL(url);

      await refreshUserDoc();
      await refresh();

      Alert.alert("Success", "Profile photo updated.");
    } catch (error: any) {
      Alert.alert("Upload failed", error?.message || "Please try again.");
    }
  }

  function handleUpgrade() {
    Alert.alert(
      "Viora Plus",
      "Payment integration will be connected in the subscription phase."
    );
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert("Logout failed", error?.message || "Please try again.");
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHero
          fullName={fullName}
          email={email}
          photoURL={photoURL}
          onPhotoPress={handlePhotoUpload}
        />

        <ProfileEditCard
          fullName={fullName}
          mobile={mobile}
          email={email}
          goal={goal}
          stressLevel={stressLevel}
          saving={saving}
          onNameChange={setFullName}
          onMobileChange={setMobile}
          onGoalChange={setGoal}
          onStressChange={setStressLevel}
          onSave={handleSaveProfile}
        />

        <ProfileSnapshotCard
          score={data?.wellnessScore ?? 0}
          goal={goal}
          stress={stressLevel}
        />

        <ProfileAIMemoryCard />

        <ProfileSubscriptionCard onUpgrade={handleUpgrade} />

        <Text style={styles.sectionTitle}>Settings & Control Center</Text>

        <ProfileSettingsList onLogout={handleLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
});