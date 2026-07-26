import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { Crown, Settings2, Sparkles, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
import { Gender, UserDoc, WellnessGoal } from "../../firebase/firestoreTypes";
import { useDashboard } from "../../hooks/useDashboard";
import { pickAndUploadProfilePhoto } from "../../services/user/profilePhotoService";
import { saveUserProfile } from "../../services/user/userService";
import { colors, radius, spacing } from "../../theme";

export default function ProfileScreen() {
  const { user, refreshUserDoc } = useAuth();
  const { data, refresh } = useDashboard();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [goal, setGoal] = useState<WellnessGoal>("Healthy Lifestyle");
  const [stressLevel, setStressLevel] = useState<NonNullable<UserDoc["stressLevel"]>>("Moderate");
  const email = user?.email || "No email";

  useEffect(() => {
    setFullName(data?.user?.fullName || user?.email?.split("@")[0] || "");
    setMobile(data?.user?.mobile || "");
    setGender(data?.user?.gender || "");
    setAge(data?.user?.age ? String(data.user.age) : "");
    setPhotoURL(data?.user?.photoURL || "");
    setGoal(data?.user?.goal || "Healthy Lifestyle");
    setStressLevel(data?.user?.stressLevel || "Moderate");
  }, [data?.user, user?.email]);

  async function handleSaveProfile() {
    if (!user) return Alert.alert("Login required", "Please login again.");
    const numericAge = Number(age);
    if (mobile && mobile.length !== 10) return Alert.alert("Invalid mobile", "Please enter a valid 10 digit mobile number.");
    if (age && (!numericAge || numericAge < 13 || numericAge > 100)) return Alert.alert("Invalid age", "Please enter a valid age between 13 and 100.");
    try {
      setSaving(true);
      await saveUserProfile({ uid: user.uid, fullName, mobile, gender: gender || undefined, age: age ? numericAge : undefined, goal, stressLevel });
      await refreshUserDoc();
      await refresh();
      Alert.alert("Profile updated", "Your profile has been saved.");
    } catch (error: any) {
      Alert.alert("Unable to save profile", error?.message || "Please try again.");
    } finally { setSaving(false); }
  }

  async function handlePhotoUpload() {
    if (!user) return Alert.alert("Login required", "Please login again.");
    if (uploadingPhoto) return;
    try {
      setUploadingPhoto(true);
      const url = await pickAndUploadProfilePhoto(user.uid);
      if (!url) return;
      setPhotoURL(url);
      await refreshUserDoc();
      await refresh();
      Alert.alert("Success", "Profile photo updated.");
    } catch (error: any) {
      Alert.alert("Upload failed", error?.message || "Please try again.");
    } finally { setUploadingPhoto(false); }
  }

  async function handleLogout() {
    try { await signOut(auth); router.replace("/login"); }
    catch (error: any) { Alert.alert("Logout failed", error?.message || "Please try again."); }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.eyebrow}>Your Viora space</Text>
            <Text style={styles.pageTitle}>Profile & preferences</Text>
          </View>
          <Pressable style={styles.settingsButton} onPress={() => router.push("/settings-center" as never)}>
            <Settings2 size={21} color={colors.primaryDark} />
          </Pressable>
        </View>

        <View style={styles.heroShell}>
          <View style={styles.heroAccent} />
          <ProfileHero fullName={uploadingPhoto ? "Uploading photo..." : fullName} email={email} photoURL={photoURL} onPhotoPress={handlePhotoUpload} />
          <View style={styles.identityStrip}>
            <View style={styles.identityItem}><UserRound size={15} color={colors.primary} /><Text style={styles.identityText}>Personal profile</Text></View>
            <View style={styles.identityItem}><Sparkles size={15} color="#6D4BC3" /><Text style={styles.identityText}>AI connected</Text></View>
            <View style={styles.identityItem}><Crown size={15} color="#A46A00" /><Text style={styles.identityText}>Premium ready</Text></View>
          </View>
        </View>

        <ProfileSnapshotCard score={data?.wellnessScore ?? 0} goal={goal} stress={stressLevel} />

        <View>
          <Text style={styles.sectionEyebrow}>Personalization</Text>
          <Text style={styles.sectionTitle}>Shape Viora around you</Text>
        </View>

        <ProfileEditCard fullName={fullName} mobile={mobile} email={email} gender={gender} age={age} goal={goal} stressLevel={stressLevel} saving={saving} onNameChange={setFullName} onMobileChange={setMobile} onGenderChange={setGender} onAgeChange={setAge} onGoalChange={setGoal} onStressChange={setStressLevel} onSave={handleSaveProfile} />
        <ProfileAIMemoryCard onPress={() => router.push("/ai-memory" as never)} />
        <ProfileSubscriptionCard onUpgrade={() => router.push("/premium" as never)} />

        <View>
          <Text style={styles.sectionEyebrow}>Account control</Text>
          <Text style={styles.sectionTitle}>Settings & privacy</Text>
        </View>
        <ProfileSettingsList onLogout={handleLogout} onNotificationsPress={() => router.push("/smart-notifications" as never)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: 42, paddingBottom: 140, gap: spacing.lg },
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  pageTitle: { color: colors.text, fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 4 },
  settingsButton: { width: 46, height: 46, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.softGreen, borderWidth: 1, borderColor: colors.border },
  heroShell: { backgroundColor: colors.white, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, overflow: "hidden" },
  heroAccent: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#E6F6EC", right: -70, top: -90 },
  identityStrip: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  identityItem: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F7FAF8", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7 },
  identityText: { color: colors.mutedText, fontSize: 10.5, fontWeight: "800" },
  sectionEyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.4, marginTop: 3 },
});
