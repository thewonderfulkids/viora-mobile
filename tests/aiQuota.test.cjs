const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../functions/src/index.ts'),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;

function harness(initial, times, initialGlobal, enforce = false, token = undefined) {
  let global = initialGlobal;
  let stored = initial, writes = 0, calls = 0;
  const exports = {};
  const db = {collection: name => ({doc: () => name}), async runTransaction(fn) {
    let result;
    for (const time of times) {
      clock = time;
      let pending, pendingGlobal;
      result = await fn({get: async key => ({data: () => key === 'aiGlobalBudget' ? global : stored}), set: (key, value) => {if (key === 'aiGlobalBudget') pendingGlobal = value; else pending = value;}});
      if (time === times[times.length-1] && pending) {stored = pending; global = pendingGlobal; writes++;}
    }
    return result;
  }};
  let clock = times[0];
  vm.runInNewContext(code, {exports, process: {env: {VIORA_ENFORCE_APP_CHECK: String(enforce)}}, Date: {now: () => clock}, console, require(id) {
    if(id === 'firebase-admin/app') return {initializeApp(){}};
    if(id === 'firebase-admin/auth') return {getAuth: () => ({verifyIdToken: async () => ({uid:'test-user'})})};
    if(id === 'firebase-admin/app-check') return {getAppCheck: () => ({verifyToken: async value => {if(value !== 'valid') throw Error('invalid'); return {};}})};
    if(id === 'firebase-admin/firestore') return {getFirestore: () => db, FieldValue:{serverTimestamp: () => null}};
    if(id === 'firebase-functions') return {setGlobalOptions(){}};
    if(id === 'firebase-functions/https') return {onRequest: (_, fn) => fn};
    if(id === './ai') return {generateWellnessAdviceHandler: async () => {calls++; return {};}};
    return {};
  }});
  return {async request() {
    let status;
    const res = {status(n){status=n;return this;},json(){},send(){}};
    await exports.generateWellnessAdviceHttp({method:'POST',get: () => token,headers:{authorization:'Bearer test'},body:{question:'hello',dashboard:{todayStats:{waterMl:0,sleepMinutes:0,yogaMinutes:0,musicMinutes:0},wellnessScore:0}}},res);
    return {status,writes,calls,stored,global};
  }};
}
const now = 86400000 + 60000;
test('quota accepts fifth minute request then rejects sixth', async () => {
  const h = harness({minute:1441,day:1,minuteCount:4,dayCount:4},[now]);
  const first = await h.request();
  assert.equal(first.status,200);
  assert.equal(first.stored.minuteCount,5);
  const second = await h.request();
  assert.equal(second.status,429);
  assert.equal(second.writes,1);
  assert.equal(second.calls,1);
});
test('daily quota rejects request even in fresh minute', async () => {
  const result = await harness({minute:1440,day:1,minuteCount:5,dayCount:100},[now]).request();
  assert.equal(result.status,429);
  assert.equal(result.calls,0);
});
test('malformed active counters fail closed', async () => {
  for(const value of [-1,0.5,'2',undefined,NaN,Infinity]) {
    for(const field of ['minuteCount','dayCount']) {
      const result = await harness({minute:1441,day:1,minuteCount:0,dayCount:0,[field]:value},[now]).request();
      assert.equal(result.status,429);
      assert.equal(result.writes,0);
    }
  }
});
test('transaction retry recomputes minute and day at midnight', async () => {
  const result = await harness({minute:1439,day:0,minuteCount:5,dayCount:100},[86399999,86400000]).request();
  assert.equal(result.status,200);
  assert.equal(result.stored.minute,1440);
  assert.equal(result.stored.day,1);
  assert.equal(result.stored.minuteCount,1);
  assert.equal(result.stored.dayCount,1);
  assert.equal(result.writes,1);
});

test('global quota rejects exhausted budget before provider or user writes', async () => {
  const result = await harness(undefined,[now],{day:1,count:1000}).request();
  assert.equal(result.status,429); assert.equal(result.calls,0); assert.equal(result.writes,0);
});
test('global quota reserves last available request and rejects next', async () => {
  const h = harness(undefined,[now],{day:1,count:999});
  assert.equal((await h.request()).global.count,1000);
  const result = await h.request();
  assert.equal(result.status,429); assert.equal(result.calls,1); assert.equal(result.writes,1);
});

test('App Check enforcement rejects missing and invalid tokens before quota', async () => {
  for (const token of [undefined, 'invalid']) {
    const r = await harness(undefined,[now],undefined,true,token).request();
    assert.equal(r.status,401); assert.equal(r.writes,0); assert.equal(r.calls,0);
  }
  const r = await harness(undefined,[now],undefined,true,'valid').request();
  assert.equal(r.status,200); assert.equal(r.calls,1);
});
