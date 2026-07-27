import {
  ExternalLink,
  FileAudio,
  Film,
  ImageIcon,
  Link2,
} from "lucide-react-native";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing } from "../../theme";
import { AdminContentInput } from "../../types";

type Props = {
  draft: AdminContentInput;
};

function safeUrl(value?: string) {
  const url = value?.trim() || "";
  return /^https?:\/\//i.test(url) ? url : "";
}

export function AdminMediaPreviewCard({ draft }: Props) {
  const mediaUrl = safeUrl(draft.url);
  const thumbnailUrl = safeUrl(draft.thumbnailUrl);
  const isAudio =
    draft.kind === "music" ||
    draft.mediaType === "audio" ||
    draft.mediaRole === "audio_track" ||
    draft.mediaRole === "background_music";

  async function openMedia() {
    if (!mediaUrl) return;
    await Linking.openURL(mediaUrl);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          {isAudio ? (
            <FileAudio size={20} color={colors.primary} />
          ) : (
            <Film size={20} color={colors.primary} />
          )}
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>Upload Preview</Text>
          <Text style={styles.subtitle}>
            Confirm the mapped file before saving or publishing it.
          </Text>
        </View>
      </View>

      <View style={styles.preview}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            resizeMode="cover"
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.placeholder}>
            <ImageIcon size={29} color={colors.primary} />
            <Text style={styles.placeholderText}>
              Thumbnail preview appears here
            </Text>
          </View>
        )}

        <View style={styles.previewCopy}>
          <Text style={styles.mediaTitle}>
            {draft.title.trim() || "Untitled content"}
          </Text>
          <Text style={styles.mapping}>
            {draft.category} →{" "}
            {draft.parentTargetId
              ? `${draft.parentTargetId} → `
              : ""}
            {draft.targetId || "not mapped"} →{" "}
            {draft.mediaRole || "media role pending"}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusPill,
                mediaUrl ? styles.readyPill : styles.pendingPill,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  mediaUrl ? styles.readyText : styles.pendingText,
                ]}
              >
                {mediaUrl ? "MEDIA READY" : "UPLOAD PENDING"}
              </Text>
            </View>

            <View style={styles.typePill}>
              <Text style={styles.typeText}>
                {isAudio ? "AUDIO" : "VIDEO"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        disabled={!mediaUrl}
        onPress={openMedia}
        style={[
          styles.previewButton,
          !mediaUrl && styles.previewButtonDisabled,
        ]}
      >
        <ExternalLink
          size={17}
          color={mediaUrl ? colors.white : colors.mutedText}
        />
        <Text
          style={[
            styles.previewButtonText,
            !mediaUrl && styles.previewButtonTextDisabled,
          ]}
        >
          {mediaUrl ? "Open Uploaded Media" : "Upload Media to Preview"}
        </Text>
      </Pressable>

      <View style={styles.helpRow}>
        <Link2 size={17} color={colors.primary} />
        <Text style={styles.helpText}>
          The user&apos;s Start or Play action resolves this permanent target ID,
          not the visible title.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  preview: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#F4FBF7",
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#EAF4EE",
  },
  placeholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "#EAF4EE",
  },
  placeholderText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  previewCopy: {
    padding: spacing.md,
  },
  mediaTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  mapping: {
    marginTop: 5,
    color: colors.mutedText,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  statusRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  readyPill: {
    backgroundColor: "#DFF7E9",
  },
  pendingPill: {
    backgroundColor: "#FFF3D8",
  },
  statusText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  readyText: {
    color: "#08784F",
  },
  pendingText: {
    color: "#946200",
  },
  typePill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "#EAF1FF",
  },
  typeText: {
    color: "#315FA8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  previewButton: {
    minHeight: 50,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
  },
  previewButtonDisabled: {
    backgroundColor: "#E7EEEA",
  },
  previewButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  previewButtonTextDisabled: {
    color: colors.mutedText,
  },
  helpRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  helpText: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
});
