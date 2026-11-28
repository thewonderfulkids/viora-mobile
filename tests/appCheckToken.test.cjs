const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");
function load(timers = {setTimeout, clearTimeout}, platform = "web", enabled = false, sdk) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,"../src/firebase/appCheckToken.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,...timers,process:{env:{EXPO_PUBLIC_APP_CHECK_ANDROID_ENABLED:String(enabled)}},require(name){if(name==="react-native")return {Platform:{OS:platform}};if(name==="@react-native-firebase/app-check" && sdk)return sdk;throw Error("Unexpected module: "+name);}});
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

test("HA01 Android rollout is opt-in and non-Android never loads native SDK",async()=>{
  assert.equal(await load(undefined,"android",false).getVioraAppCheckToken(),null);
  assert.equal(await load(undefined,"web",true).getVioraAppCheckToken(),null);
});
test("HA01 enabled Android uses Play Integrity and shares initialization",async()=>{
  let initializations=0;
  let configured;
  const instance={};
  const sdk={
    ReactNativeFirebaseAppCheckProvider:class {configure(options){configured=options.android.provider;}},
    async initializeAppCheck(app,options){initializations++;assert.equal(options.isTokenAutoRefreshEnabled,true);return instance;},
    async getToken(appCheck,force){assert.equal(appCheck,instance);assert.equal(force,false);return {token:"native-token"};}
  };
  const bridge=load(undefined,"android",true,sdk);
  assert.deepEqual(await Promise.all([bridge.getVioraAppCheckToken(),bridge.getVioraAppCheckToken()]),["native-token","native-token"]);
  assert.equal(configured,"playIntegrity");
  assert.equal(initializations,1);
});
