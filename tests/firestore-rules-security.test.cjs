const { readFileSync } = require("node:fs");
const { test, after } = require("node:test");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { doc, setDoc, getDoc, updateDoc } = require("firebase/firestore");

let environment;
const projectId = "viora-rules-security-test";
async function env() {
  if (!environment) {
    environment = await initializeTestEnvironment({
      projectId,
      firestore: {
        host: "127.0.0.1",
        port: 8080,
        rules: readFileSync("firestore.rules", "utf8"),
      },
    });
  }
  return environment;
}
after(async () => { if (environment) await environment.cleanup(); });
function user(uid, claims = {}) { return environment.authenticatedContext(uid, claims).firestore(); }
async function seed(path, data) {
  await environment.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

test("users cannot assign themselves admin or subscription entitlements", async () => {
  await env();
  const alice = user("alice");
  await assertFails(setDoc(doc(alice, "users/alice"), {uid:"alice", role:"super_admin"}));
  await assertFails(setDoc(doc(alice, "users/alice"), {uid:"alice", subscriptionStatus:"active"}));
  await assertSucceeds(setDoc(doc(alice, "users/alice"), {uid:"alice", fullName:"Alice", email:"alice@example.com", createdAt: new Date()}));
  await assertFails(updateDoc(doc(alice, "users/alice"), {isPremium:true}));
  await assertFails(updateDoc(doc(alice, "users/alice"), {role:"admin"}));
  await assertFails(updateDoc(doc(alice, "users/alice"), {unknownFuturePrivilege:true}));
  await assertSucceeds(updateDoc(doc(alice, "users/alice"), {fullName:"Alice B"}));
});

test("foreign-owned prefixed records cannot be read or overwritten", async () => {
  await env();
  await seed("dailyStats/alice_2026-11-24", {uid:"bob", steps:100});
  const alice = user("alice");
  await assertFails(getDoc(doc(alice, "dailyStats/alice_2026-11-24")));
  await assertFails(updateDoc(doc(alice, "dailyStats/alice_2026-11-24"), {steps:200}));
  await assertFails(setDoc(doc(alice, "wellnessGoals/alice_bad"), {uid:"bob", title:"bad"}));
});

test("owner identity cannot change and cross-user documents remain private", async () => {
  await env();
  await seed("hydrationLogs/log1", {uid:"alice", waterMl:250});
  const alice = user("alice"), bob = user("bob");
  await assertFails(getDoc(doc(bob, "hydrationLogs/log1")));
  await assertFails(updateDoc(doc(alice, "hydrationLogs/log1"), {uid:"bob"}));
  await assertSucceeds(updateDoc(doc(alice, "hydrationLogs/log1"), {waterMl:300}));
});

test("clients cannot forge payment, subscription or deletion state", async () => {
  await env();
  const alice = user("alice");
  await assertFails(setDoc(doc(alice, "payments/p1"), {uid:"alice", status:"paid"}));
  await assertFails(setDoc(doc(alice, "subscriptions/s1"), {uid:"alice", status:"active"}));
  await assertFails(setDoc(doc(alice, "accountDeletionRequests/alice"), {userId:"alice", status:"completed"}));
  await assertFails(setDoc(doc(alice, "aiRequestLogs/log1"), {userId:"alice"}));
});
