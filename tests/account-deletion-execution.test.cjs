const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
// Load the actual policy dependency, not a permissive mock.
const modules = new Map();
function loadDeletionModule(name) {
 if (!["deletionExecutionCore","retentionPolicy","inventoryManifest"].includes(name)) throw Error("Unexpected module: "+name);
 if (modules.has(name)) return modules.get(name);
 const exports = {};
 modules.set(name,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync("functions/src/accountDeletion/"+name+".ts","utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:specifier=>{
  if (!specifier.startsWith("./")) throw Error("Unexpected import: "+specifier);
  return loadDeletionModule(specifier.slice(2));
 }});
 return exports;
}
const exportsObject = loadDeletionModule("deletionExecutionCore");
const {planDeletion,executeDeletion,isExistingDeletionRequest}=exportsObject;
const record={path:"dailyStats/a",ownerIds:["a"],shared:false,retained:false};
test("rejects incomplete and foreign ownership",()=>{
 assert.throws(()=>planDeletion("a",{complete:false,candidates:[],unresolved:[]}),/Incomplete/);
 assert.throws(()=>planDeletion("a",{complete:true,candidates:[{...record,ownerIds:["b"]}],unresolved:[]}),/ownership/);
});
test("retains shared and financial records",()=>{
 assert.equal(planDeletion("a",{complete:true,candidates:[{...record,shared:true},{...record,retained:true}],unresolved:[]}).length,0);
});
test("rejects conflicting evidence for the same path in either order",()=>{
 for(const protectedRecord of [{...record,shared:true},{...record,retained:true}]){
  for(const candidates of [[record,protectedRecord],[protectedRecord,record]]){
   assert.throws(()=>planDeletion("a",{complete:true,candidates,unresolved:[]}),/Conflicting deletion evidence/);
  }
 }
 assert.equal(planDeletion("a",{complete:true,candidates:[record,{...record}],unresolved:[]}).length,1);
});
test("preserves active, recovery, and terminal states on repeat requests",()=>{
 for(const status of ["requested","preflight","processing","retry_required","auth_pending","completed"]){
  assert.equal(isExistingDeletionRequest(status),true);
 }
 assert.equal(isExistingDeletionRequest(undefined),false);
 assert.equal(isExistingDeletionRequest("unknown"),false);
});
test("auth is removed only after verified cleanup; failures remain retryable",async()=>{
 let records=[record], events=[], fail=true;
 const adapter={withExclusiveLease:async(_,run)=>run(),assertAuthorizedAndFrozen:async()=>{},readCheckpoint:async()=>null,inventory:async()=>({complete:true,candidates:records,unresolved:[]}),eraseOwnedRecord:async()=>{if(fail)throw Error("failed");records=[]},eraseOwnedStorage:async()=>{},verifyStorageEmpty:async()=>true,checkpoint:async(_,s)=>events.push(s),eraseAuthIfPresent:async()=>events.push("auth")};
 await assert.rejects(executeDeletion("a",adapter),/failed/);
 assert.equal(events.includes("auth"),false);
 assert.equal(events.at(-1),"retry_required");
 fail=false;
 assert.equal((await executeDeletion("a",adapter)).complete,true);
 assert.equal(events.at(-2),"auth");
 assert.equal(events.at(-1),"completed");
});
function recoveryFixture({failedWrite, ambiguous=false}){
 let status=null, auth="original", failed=false;
 const events=[];
 const adapter={
  withExclusiveLease:async(_,run)=>run(),
  readCheckpoint:async()=>status,
  assertAuthorizedAndFrozen:async(_,phase)=>{
   events.push(phase);
   if(phase==="cleanup" && auth!=="original")throw Error("Original account required");
   if(phase!=="cleanup" && auth==="replacement")throw Error("Account generation changed");
  },
  inventory:async()=>{events.push("inventory");return {complete:true,candidates:[],unresolved:[]}},
  eraseOwnedRecord:async()=>assert.fail("no records to erase"),
  eraseOwnedStorage:async()=>events.push("storage"),
  verifyStorageEmpty:async()=>true,
  checkpoint:async(_,next)=>{
   if(next===failedWrite && !failed){
    failed=true;
    if(ambiguous)status=next;
    throw Error("checkpoint response lost");
   }
   status=next;
  },
  eraseAuthIfPresent:async()=>{
   if(auth==="original"){events.push("auth erased");auth=null}
   else if(auth===null){events.push("auth already absent")}
   else assert.fail("replacement must not be erased");
  },
 };
 return {adapter,events,status:()=>status,recreate:()=>{auth="replacement"}};
}
test("completion write failure recovers after Auth was erased and never repeats data cleanup",async()=>{
 const f=recoveryFixture({failedWrite:"completed"});
 await assert.rejects(executeDeletion("a",f.adapter),/checkpoint response lost/);
 assert.equal(f.status(),"auth_pending");
 assert.equal((await executeDeletion("a",f.adapter)).complete,true);
 assert.equal((await executeDeletion("a",f.adapter)).complete,true);
 assert.deepEqual(f.events,["cleanup","inventory","storage","inventory","auth erased","auth_pending","auth already absent","completed"]);
 assert.equal(f.status(),"completed");
});
test("ambiguous auth_pending write may be recovered without running cleanup again",async()=>{
 const f=recoveryFixture({failedWrite:"auth_pending",ambiguous:true});
 await assert.rejects(executeDeletion("a",f.adapter),/checkpoint response lost/);
 assert.equal(f.status(),"auth_pending");
 assert.equal(f.events.includes("auth erased"),false);
 assert.equal((await executeDeletion("a",f.adapter)).complete,true);
 assert.deepEqual(f.events,["cleanup","inventory","storage","inventory","auth_pending","auth erased"]);
});
test("auth_pending recovery refuses a replacement account",async()=>{
 const f=recoveryFixture({failedWrite:"completed"});
 await assert.rejects(executeDeletion("a",f.adapter),/checkpoint response lost/);
 f.recreate();
 await assert.rejects(executeDeletion("a",f.adapter),/Account generation changed/);
 assert.equal(f.status(),"auth_pending");
 assert.equal(f.events.filter(e=>e.startsWith("auth ")).length,1);
});

test("C05 bounded cleanup resumes without erasing Auth before all records are gone",async()=>{
 let records=Array.from({length:101},(_,i)=>({...record,path:"dailyStats/"+i}));
 let state=null,authCalls=0,storageCalls=0;
 const adapter={
  withExclusiveLease:async(_,run)=>run(),
  assertAuthorizedAndFrozen:async()=>{},
  readCheckpoint:async()=>state,
  inventory:async()=>({complete:true,candidates:records,unresolved:[]}),
  eraseOwnedRecord:async(_,candidate)=>{records=records.filter(r=>r.path!==candidate.path)},
  eraseOwnedStorage:async()=>{storageCalls++},
  verifyStorageEmpty:async()=>true,
  checkpoint:async(_,next)=>{state=next},
  eraseAuthIfPresent:async()=>{authCalls++},
 };
 assert.equal((await executeDeletion("a",adapter)).complete,false);
 assert.equal(records.length,1);
 assert.equal(state,"processing");
 assert.equal(authCalls,0);
 assert.equal(storageCalls,0);
 assert.equal((await executeDeletion("a",adapter)).complete,true);
 assert.equal(records.length,0);
 assert.equal(authCalls,1);
 assert.equal(storageCalls,1);
 assert.equal(state,"completed");
});
test("C05 residual storage blocks Auth erasure and leaves retry checkpoint",async()=>{
 let state=null,authCalls=0;
 const adapter={
  withExclusiveLease:async(_,run)=>run(),
  assertAuthorizedAndFrozen:async()=>{},
  readCheckpoint:async()=>state,
  inventory:async()=>({complete:true,candidates:[],unresolved:[]}),
  eraseOwnedRecord:async()=>assert.fail("unexpected record"),
  eraseOwnedStorage:async()=>{},
  verifyStorageEmpty:async()=>false,
  checkpoint:async(_,next)=>{state=next},
  eraseAuthIfPresent:async()=>{authCalls++},
 };
 await assert.rejects(executeDeletion("a",adapter),/Cleanup verification failed/);
 assert.equal(state,"retry_required");
 assert.equal(authCalls,0);
});

test("C05 protected record blocks every destructive operation",async()=>{
 const events=[];
 const adapter={
  withExclusiveLease:async(_,run)=>run(),
  assertAuthorizedAndFrozen:async()=>{},
  readCheckpoint:async()=>null,
  inventory:async()=>({complete:true,unresolved:[],candidates:[record,{...record,path:"payments/p1"}]}),
  checkpoint:async()=>events.push("checkpoint"),
  eraseOwnedRecord:async()=>events.push("record"),
  eraseOwnedStorage:async()=>events.push("storage"),
  verifyStorageEmpty:async()=>true,
  eraseAuthIfPresent:async()=>events.push("auth"),
 };
 await assert.rejects(executeDeletion("a",adapter),/Retention policy review required/);
 assert.deepEqual(events,[]);
});
