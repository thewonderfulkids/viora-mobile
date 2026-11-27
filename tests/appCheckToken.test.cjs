const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");
function load(timers = {setTimeout, clearTimeout}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,"../src/firebase/appCheckToken.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,...timers});
  return exports;
}
test("H08 token bridge preserves legacy clients and rejects malformed attestation",async()=>{
  const bridge=load();
  assert.equal(await bridge.getVioraAppCheckToken(),null);
  for(const value of [null,"","   ","x".repeat(8193),42]){
    bridge.registerAppCheckTokenProvider(async()=>value);
    await assert.rejects(bridge.getVioraAppCheckToken(),/App verification unavailable/);
  }
  bridge.registerAppCheckTokenProvider(async()=> "verified-token");
  assert.equal(await bridge.getVioraAppCheckToken(),"verified-token");
  bridge.registerAppCheckTokenProvider(async()=>{throw Error("attestation failed");});
  await assert.rejects(bridge.getVioraAppCheckToken(),/attestation failed/);
});

test("H08 stalled attestation fails closed instead of hanging",async()=>{
  const bridge=load({setTimeout:fn=>{queueMicrotask(fn);return 1;},clearTimeout:()=>{}});
  bridge.registerAppCheckTokenProvider(()=>new Promise(()=>{}));
  await assert.rejects(bridge.getVioraAppCheckToken(),/App verification unavailable/);
});
