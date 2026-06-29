import { LinearGradient } from "expo-linear-gradient";
import { Crown } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileHeroProps = {
  fullName: string;
  email: string;
  photoURL?: string;
  memberTitle?: string;
  onPhotoPress?: () => void;
};

export function ProfileHero({
  fullName,
  email,
  photoURL,
  memberTitle = "Free Wellness Member",
  onPhotoPress,
}: ProfileHeroProps) {
  return (
    <LinearGradient
      colors={["#0B6E4F", "#159A72", "#EAF7EF"]}
      style={styles.hero}
    >
      <ProfileAvatar
        name={fullName}
        photoURL={photoURL}
        onPress={onPhotoPress}
      />

      <Text style={styles.name}>
        {fullName || "Viora User"}
      </Text>

      <Text style={styles.email}>
        {email}
      </Text>

      <View style={styles.memberBadge}>
        <Crown
          size={15}
          color="#B7791F"
        />

        <Text style={styles.memberText}>
          {memberTitle}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: "center",
  },

  name: {
    marginTop: spacing.md,
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  email: {
    marginTop: 4,
    color: "#EAF7EF",
    fontSize: 14,
    fontWeight: "700",
  },

  memberBadge: {
    marginTop: spacing.md,
    backgroundColor: "#FEF3C7",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  memberText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "900",
  },
});