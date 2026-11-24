const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("functions/src/accountDeletion/deletionExecutionCore.ts","utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsObject});
const {planDeletion,executeDeletion}=exportsObject;
const record={path:"dailyStats/a",ownerIds:["a"],shared:false,retained:false};
test("rejects incomplete and foreign ownership",()=>{
 assert.throws(()=>planDeletion("a",{complete:false,candidates:[],unresolved:[]}),/Incomplete/);
 assert.throws(()=>planDeletion("a",{complete:true,candidates:[{...record,ownerIds:["b"]}],unresolved:[]}),/ownership/);
});
test("retains shared and financial records",()=>{
 assert.equal(planDeletion("a",{complete:true,candidates:[{...record,shared:true},{...record,retained:true}],unresolved:[]}).length,0);
});
test("auth is removed only after verified cleanup; failures remain retryable",async()=>{
 let records=[record], events=[], fail=true;
 const adapter={withExclusiveLease:async(_,run)=>run(),assertAuthorizedAndFrozen:async()=>{},inventory:async()=>({complete:true,candidates:records,unresolved:[]}),eraseOwnedRecord:async()=>{if(fail)throw Error("failed");records=[]},eraseOwnedStorage:async()=>{},verifyStorageEmpty:async()=>true,checkpoint:async(_,s)=>events.push(s),eraseAuth:async()=>events.push("auth")};
 await assert.rejects(executeDeletion("a",adapter),/failed/);
 assert.equal(events.includes("auth"),false);
 assert.equal(events.at(-1),"retry_required");
 fail=false;
 assert.equal((await executeDeletion("a",adapter)).complete,true);
 assert.equal(events.at(-2),"auth");
 assert.equal(events.at(-1),"completed");
});
