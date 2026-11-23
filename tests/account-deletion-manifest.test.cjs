const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("deletion manifest covers every user-owned Firestore rule collection", () => {
  const rules = fs.readFileSync("firestore.rules", "utf8");
  const manifest = fs.readFileSync("functions/src/accountDeletion/inventoryManifest.ts", "utf8");
  const queryBlock = manifest.match(/USER_QUERY_COLLECTIONS = \[([\s\S]*?)\] as const/);
  const directBlock = manifest.match(/USER_UID_DOCUMENT_COLLECTIONS = \[([\s\S]*?)\] as const/);
  assert.ok(queryBlock && directBlock);
  const entries = new Set([...queryBlock[1].matchAll(/"([^"]+)"/g), ...directBlock[1].matchAll(/"([^"]+)"/g)].map(m => m[1]));
  const exclusions = new Set([
    "appSettings", "adminContent", "premiumFeatures", "accountDeletionRequests"
  ]);
  // The Firestore /databases/{database}/documents wrapper is not a collection.
  const collections = [...rules.matchAll(/match \/([A-Za-z][A-Za-z0-9]*)\/\{[^}]+\}/g)]
    .map(m => m[1])
    .filter(name => name !== "databases");
  const missing = collections.filter(name => !entries.has(name) && !exclusions.has(name));
  assert.deepEqual(missing, [], "Missing collections in deletion manifest: " + missing.join(", "));
});
