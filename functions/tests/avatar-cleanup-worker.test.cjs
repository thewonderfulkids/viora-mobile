const { test } = require("node:test");
const assert = require("node:assert/strict");
const { runAvatarCleanup } = require("../lib/avatarCleanupWorker");
const now = Date.now();
const file = { name:"profile-photos/a/avatar-1.jpg", generation:"123", timeCreated:new Date(now-8*86400000).toISOString(), contentType:"image/jpeg", metadata:{uid:"a",source:"viora-mobile-profile-avatar"} };
test("H06 retirement precedes generation deletion and lock always releases", async () => {
  const calls = [];
  const lease = { profile:{}, bucket:"test", listCandidates:async()=>[file], retireReference:async()=>{calls.push("retire");}, deleteGeneration:async()=>{calls.push("delete");throw Error("retry");}, release:async()=>{calls.push("release");} };
  assert.deepEqual(await runAvatarCleanup({acquire:async()=>lease},"a",now),{deleted:0,failed:1,skipped:false});
  assert.deepEqual(calls,["retire","delete","release"]);
  calls.length=0;
  lease.retireReference=async()=>{throw Error("retirement failed");};
  await runAvatarCleanup({acquire:async()=>lease},"a",now);
  assert.deepEqual(calls,["release"]);
  assert.equal((await runAvatarCleanup({acquire:async()=>null},"a",now)).skipped,true);
});
