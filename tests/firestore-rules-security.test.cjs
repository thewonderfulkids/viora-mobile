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

test("concurrent quota transactions enforce the five-request limit", async () => {
  await env();
  await environment.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    const quota = doc(db, "aiRateLimits/concurrency-test");
    await setDoc(quota, {uid:"concurrency-test", minute:1441, day:1, minuteCount:0, dayCount:0});
    const { runTransaction } = require("firebase/firestore");
    const outcomes = await Promise.all(Array.from({length: 8}, () =>
      runTransaction(db, async tx => {
        const old = (await tx.get(quota)).data();
        if (old.minuteCount >= 5 || old.dayCount >= 100) return false;
        tx.update(quota, {minuteCount:old.minuteCount+1, dayCount:old.dayCount+1});
        return true;
      }, {maxAttempts: 10})
    ));
    const assert = require("node:assert/strict");
    assert.equal(outcomes.filter(Boolean).length, 5);
    const final = (await getDoc(quota)).data();
    assert.equal(final.minuteCount, 5);
    assert.equal(final.dayCount, 5);
  });
});

test("clients cannot reset server-owned AI quota counters", async () => {
  await env();
  await seed("aiRateLimits/alice", {uid:"alice", minuteCount:5, dayCount:100});
  const alice = user("alice");
  await assertFails(updateDoc(doc(alice, "aiRateLimits/alice"), {minuteCount:0, dayCount:0}));
  await assertFails(setDoc(doc(alice, "aiRateLimits/alice"), {uid:"alice", minuteCount:0, dayCount:0}));
});

test("C02 frozen account cannot create update delete or remove its lock", async () => {
  await env();
  const uid = "freeze-test";
  const db = user(uid), other = user("freeze-other");
  const goal = doc(db, "wellnessGoals/freeze-test_goal");
  await assertSucceeds(setDoc(goal, {uid, title:"before"}));
  await assertFails(setDoc(doc(db, "accountDeletionLocks/"+uid), {frozen:true}));
  await seed("accountDeletionLocks/"+uid, {frozen:true});
  await assertFails(setDoc(doc(db, "hydrationLogs/freeze-new"), {uid, waterMl:250}));
  await assertFails(updateDoc(goal, {title:"after"}));
  await assertFails(require("firebase/firestore").deleteDoc(goal));
  await assertFails(require("firebase/firestore").deleteDoc(doc(db,"accountDeletionLocks/"+uid)));
  await assertSucceeds(getDoc(goal));
  await assertSucceeds(setDoc(doc(other,"hydrationLogs/unfrozen-new"), {uid:"freeze-other",waterMl:250}));
});

 test("P0-HA01 legacy prefix cannot expose or delete foreign-owned records", async () => {
  await env();
  const alice = user("alice"), bob = user("bob");
  const { deleteDoc } = require("firebase/firestore");
  for (const collection of ["wellnessIntelligenceSnapshots","wellnessHabits","habitCompletions","nutritionEntries","nutritionSummaries","nutritionGoals","moodEntries","moodCheckIns","mentalWellnessSummaries","mentalWellnessGoals","wellnessReports","nutritionReports","mentalWellnessReports","goalReports","reportExports","voiceCommands","voiceSessions","familyGroups","familyMembers","familyInvites"]) {
    const path = collection + "/alice_foreign";
    await seed(path, {uid:"bob", ownerUserId:"bob"});
    await assertFails(getDoc(doc(alice,path)));
    await assertFails(deleteDoc(doc(alice,path)));
    await assertSucceeds(getDoc(doc(bob,path)));
  }
  await seed("wellnessHabits/alice_legacy", {title:"legacy"});
  await assertSucceeds(getDoc(doc(alice,"wellnessHabits/alice_legacy")));
  await assertSucceeds(deleteDoc(doc(alice,"wellnessHabits/alice_legacy")));
});

test("P0-HA01 family records reject foreign ownership on create and update", async () => {
  await env();
  const alice = user("alice"), bob = user("bob");
  for (const collection of ["familyGroups","familyMembers","familyInvites"]) {
    const path = collection + "/alice_family_write";
    await assertFails(setDoc(doc(alice,path), {uid:"alice",ownerUserId:"bob"}));
    await seed(path,{uid:"bob",ownerUserId:"bob",title:"before"});
    await assertFails(updateDoc(doc(alice,path),{title:"after"}));
    await assertSucceeds(updateDoc(doc(bob,path),{title:"after"}));
    await assertSucceeds(setDoc(doc(alice,collection+"/alice_valid"),{uid:"alice",ownerUserId:"alice"}));
  }
});

test("P0-HA03 admin claims permit profile edits but not privilege escalation", async()=>{
 await env();
 await seed("users/admin-target",{uid:"admin-target",fullName:"Before"});
 for(const claims of [{admin:true},{superAdmin:true},{role:"admin"},{role:"super_admin"}]){
  const db=user("admin-actor",claims), target=doc(db,"users/admin-target");
  await assertSucceeds(getDoc(target));
  await assertSucceeds(updateDoc(target,{fullName:"After"}));
  for(const change of [{role:"super_admin"},{isPremium:true},{subscriptionStatus:"active"},{uid:"admin-actor"}]) await assertFails(updateDoc(target,change));
 }
 await seed("accountDeletionLocks/admin-target",{frozen:true});
 await assertFails(updateDoc(doc(user("admin-actor",{admin:true}),"users/admin-target"),{fullName:"Frozen"}));
});

test("HA07 privacy and security settings reject conflicting owners",async()=>{
 await env();
 for(const c of ["privacySettings","securitySettings"]){
  const db=user("settings-alice"), own=doc(db,c+"/settings-alice");
  await assertFails(setDoc(own,{uid:"settings-bob",enabled:true}));
  await seed(c+"/settings-alice",{uid:"settings-bob",enabled:true});
  await assertFails(getDoc(own));
  await assertFails(updateDoc(own,{enabled:false}));
  await seed(c+"/settings-alice",{enabled:true});
  await assertSucceeds(getDoc(own));
  await assertSucceeds(updateDoc(own,{enabled:false}));
  await assertFails(updateDoc(own,{userId:"settings-bob"}));
 }
});
