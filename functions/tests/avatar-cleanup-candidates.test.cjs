const { test } = require("node:test");
const assert = require("node:assert/strict");
const { selectOrphanAvatars, AVATAR_GRACE_MS } = require("../lib/avatarCleanupCandidates");
const now = Date.now();
const file = (id, overrides = {}) => ({
  name: "profile-photos/a/avatar-" + id + ".jpg", generation: "123",
  timeCreated: new Date(now - AVATAR_GRACE_MS - 1000).toISOString(),
  contentType: "image/jpeg", metadata: { uid: "a", source: "viora-mobile-profile-avatar" }, ...overrides,
});
test("H06 protects all active aliases and rejects unsafe candidates", () => {
  const files = [file(1), file(2), file(3), file(4), file(5, {timeCreated: new Date(now).toISOString()}), file(6, {generation: undefined}), file(7, {metadata: {uid:"b"}}), file(8, {name:"profile-photos/b/avatar-8.jpg"})];
  const profile = { photoURL: files[0].name, photoUrl: "https://firebasestorage.googleapis.com/v0/b/test/o/" + encodeURIComponent(files[1].name) + "?alt=media", avatarUrl: files[2].name };
  assert.deepEqual(selectOrphanAvatars("a", "test", profile, files, now), [files[3]]);
  assert.deepEqual(selectOrphanAvatars("a", "test", {photoURL:"https://unknown.invalid/avatar"}, files, now), []);
});
