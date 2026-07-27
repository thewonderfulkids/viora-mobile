import { useVideoPlayer, VideoView } from "expo-video";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { AdminManagedContent } from "../../types";

type Props = {
  workout: AdminManagedContent;
  exerciseMedia: AdminManagedContent[];
  onClose: () => void;
};

function ExerciseVideo({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const player = useVideoPlayer(url, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.volume = 1;
    instance.play();
  });

  useEffect(
    () => () => {
      try {
        player.pause();
      } catch {}
    },
    [player],
  );

  return (
    <>
      <Text style={styles.nowTitle}>{title}</Text>
      <VideoView
        player={player}
        nativeControls
        contentFit="contain"
        style={styles.video}
      />
    </>
  );
}

export function MappedWorkoutPlayer({
  workout,
  exerciseMedia,
  onClose,
}: Props) {
  const sorted = useMemo(
    () => [...exerciseMedia].sort((a, b) => a.sortOrder - b.sortOrder),
    [exerciseMedia],
  );
  const [index, setIndex] = useState(0);

  const current = sorted[index];

  if (!current && workout.url) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>FULL WORKOUT VIDEO</Text>
            <Text style={styles.title}>{workout.title}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.close}>
            <X size={19} color={colors.text} />
          </Pressable>
        </View>
        <ExerciseVideo url={workout.url} title={workout.title} />
      </View>
    );
  }

  if (!current) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>
            EXERCISE {index + 1} OF {sorted.length}
          </Text>
          <Text style={styles.title}>{workout.title}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.close}>
          <X size={19} color={colors.text} />
        </Pressable>
      </View>

      <ExerciseVideo
        key={current.url}
        url={current.url}
        title={current.title}
      />

      <View style={styles.controls}>
        <Pressable
          disabled={index === 0}
          onPress={() => setIndex((value) => Math.max(0, value - 1))}
          style={[styles.control, index === 0 && styles.disabled]}
        >
          <ChevronLeft size={18} color={colors.primary} />
          <Text style={styles.controlText}>Previous</Text>
        </Pressable>

        <Pressable
          disabled={index >= sorted.length - 1}
          onPress={() =>
            setIndex((value) => Math.min(sorted.length - 1, value + 1))
          }
          style={[
            styles.control,
            index >= sorted.length - 1 && styles.disabled,
          ]}
        >
          <Text style={styles.controlText}>Next Exercise</Text>
          <ChevronRight size={18} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: radius.xxl,
    backgroundColor: "#061D17",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  header: {
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  eyebrow: {
    color: "#9DE8C4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    marginTop: 3,
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  nowTitle: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  controls: {
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  control: {
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.white,
  },
  disabled: { opacity: 0.35 },
  controlText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
});
