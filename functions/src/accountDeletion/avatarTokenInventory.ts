/** Diagnostic only. Never returns token values or modifies object metadata. */
export function summarizeAvatarTokenMetadata(metadata: unknown): {
  tokenPresent: boolean;
  metadataReviewRequired: boolean;
} {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { tokenPresent: false, metadataReviewRequired: true };
  }
  const custom = (metadata as { metadata?: unknown }).metadata;
  if (custom === undefined) return { tokenPresent: false, metadataReviewRequired: false };
  if (!custom || typeof custom !== "object" || Array.isArray(custom)) {
    return { tokenPresent: false, metadataReviewRequired: true };
  }
  const token = (custom as Record<string, unknown>).firebaseStorageDownloadTokens;
  if (token === undefined) return { tokenPresent: false, metadataReviewRequired: false };
  if (typeof token !== "string") return { tokenPresent: false, metadataReviewRequired: true };
  return { tokenPresent: token.trim().length > 0, metadataReviewRequired: false };
}
