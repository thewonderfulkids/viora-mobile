import { Camera } from "lucide-react-native";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "../../theme";

type ProfileAvatarProps = {
  name?: string | null;
  photoURL?: string;
  onPress?: () => void;
};

function getInitials(name?: string | null) {
  if (!name) return "V";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileAvatar({
  name,
  photoURL,
  onPress,
}: ProfileAvatarProps) {
  return (
    <View style={styles.avatarWrap}>
      <View style={styles.avatar}>
        {photoURL ? (
            <Image
            source={{ uri: photoURL }}
            style={styles.image}
            />
        ) : (
            <Text style={styles.avatarText}>
            {getInitials(name)}
            </Text>
        )}
    </View>

      <Pressable onPress={onPress} style={styles.cameraButton}>
        <Camera size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 47,
  },

  cameraButton: {
    position: "absolute",
    right: -4,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
});