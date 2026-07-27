import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FULL_FILM_MS = 5000;
const VIDEO_SOURCE = require("../../../assets/videos/launch_intro.mp4");

interface LaunchExperienceProps {
  onComplete: () => void;
}

export function LaunchExperience({
  onComplete,
}: LaunchExperienceProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const completedRef = useRef(false);
  const fade = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;

  const player = useVideoPlayer(VIDEO_SOURCE, (instance) => {
    instance.loop = false;
    // Browsers generally block autoplay with audio. Native Android/iOS keeps sound on.
    instance.muted = Platform.OS === "web";
    instance.volume = Platform.OS === "web" ? 0 : 0.9;
  });

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Animated.timing(fade, {
      toValue: 0,
      duration: 260,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => onComplete());
  }, [fade, onComplete]);

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 7,
      tension: 55,
      useNativeDriver: Platform.OS !== "web",
    }).start();

    try {
      player.currentTime = 0;
      player.muted = Platform.OS === "web";
      player.volume = Platform.OS === "web" ? 0 : 0.9;
      player.play();
    } catch {
      setVideoFailed(true);
    }

    const timer = setTimeout(finish, FULL_FILM_MS);

    return () => {
      clearTimeout(timer);
      try {
        player.pause();
      } catch {
        // Player may already be disposed during route transition.
      }
    };
  }, [finish, logoScale, player]);

  useEffect(() => {
    if (Platform.OS !== "web" || videoFailed) return;

    const retryTimer = setTimeout(() => {
      try {
        player.muted = true;
        player.volume = 0;
        player.play();
      } catch {
        setVideoFailed(true);
      }
    }, 300);

    return () => clearTimeout(retryTimer);
  }, [player, videoFailed]);

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <LinearGradient
        colors={["#021F18", "#054A34", "#0B6E4F"]}
        style={styles.background}
      />

      {!videoFailed ? (
        <VideoView
          accessibilityLabel="Viora cinematic launch"
          contentFit="cover"
          nativeControls={false}
          player={player}
          style={styles.video}
        />
      ) : (
        <SafeAreaView style={styles.fallback}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={require("../../../assets/images/viora-brand-mark.png")}
              style={styles.logo}
            />
          </Animated.View>

          <Text style={styles.brand}>V I O R A</Text>
          <Text style={styles.tagline}>
            Your Mind. Your Body. Your Companion.
          </Text>
          <ActivityIndicator color="#98E85F" size="small" style={styles.loader} />
        </SafeAreaView>
      )}

      <View pointerEvents="none" style={styles.ambientOne} />
      <View pointerEvents="none" style={styles.ambientTwo} />

      <SafeAreaView pointerEvents="box-none" style={styles.skipArea}>
        <Pressable
          accessibilityLabel="Skip Viora introduction"
          accessibilityRole="button"
          onPress={finish}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#021F18",
    zIndex: 999,
  },
  background: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  video: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logo: {
    width: 190,
    height: 190,
  },
  brand: {
    marginTop: 24,
    color: "#F3FFF5",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 8,
  },
  tagline: {
    marginTop: 12,
    color: "#CDEAD7",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  loader: {
    marginTop: 34,
  },
  ambientOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(91, 221, 99, 0.09)",
    top: -90,
    right: -120,
  },
  ambientTwo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(185, 255, 102, 0.07)",
    bottom: -70,
    left: -80,
  },
  skipArea: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingTop: 10,
    paddingRight: 16,
  },
  skipButton: {
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
