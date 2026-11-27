const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function fixture(enabled, ids, cursor) {
  const calls = [];
  const query = { where(...args) { calls.push(["where", ...args]); return this; }, orderBy() { return this; }, limit(n) { calls.push(["limit",n]); return this; }, startAfter(id) { calls.push(["after",id]); return this; }, async get() { return {docs:ids.map(id=>({id})),size:ids.length}; } };
  const state = { async get() { return {get:()=>cursor}; }, async set(value) { calls.push(["cursor",value.cursor]); } };
  const imports = {
    "firebase-admin/firestore": {FieldPath:{documentId:()=> "id"},getFirestore:()=>{calls.push(["db"]);return {collection:name=>name==="users"?query:{doc:()=>state}};}},
    "firebase-functions/v2/scheduler": {onSchedule:(_options,handler)=>handler},
    "./avatarCleanupWorker": {runAvatarCleanup:async(_store,id)=>{calls.push(["cleanup",id]);return {failed:0};}},
    "./firebaseAvatarCleanupStore": {firebaseAvatarCleanupStore:()=>({})},
  };
  const exports = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../lib/scheduledAvatarCleanup.js"),"utf8"),{exports,require:name=>{assert.ok(Object.hasOwn(imports,name),name);return imports[name];},process:{env:{VIORA_ENABLE_AVATAR_CLEANUP:enabled}},console});
  return {run:exports.scheduledAvatarCleanup,calls};
}
test("H06 scheduler disabled by default and only scans managed profiles when enabled",async()=>{
  const disabled=fixture(undefined,["a"]);
  await disabled.run();
  assert.deepEqual(disabled.calls,[]);
  const enabled=fixture("true",["b"],"a");
  await enabled.run();
  assert.deepEqual(enabled.calls,[["db"],["where","avatarServerManaged","==",true],["limit",10],["after","a"],["cleanup","b"],["cursor","b"],["cursor",null]]);
});
