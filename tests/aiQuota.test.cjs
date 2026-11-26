const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../functions/src/index.ts'),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;

function harness(initial, times) {
  let stored = initial, writes = 0, calls = 0;
  const exports = {};
  const db = {collection: () => ({doc: () => ({})}), async runTransaction(fn) {
    let result;
    for (const time of times) {
      clock = time;
      let pending;
      result = await fn({get: async () => ({data: () => stored}), set: (_, value) => {pending = value;}});
      if (time === times[times.length-1] && pending) {stored = pending; writes++;}
    }
    return result;
  }};
  let clock = times[0];
  vm.runInNewContext(code, {exports, Date: {now: () => clock}, console, require(id) {
    if(id === 'firebase-admin/app') return {initializeApp(){}};
    if(id === 'firebase-admin/auth') return {getAuth: () => ({verifyIdToken: async () => ({uid:'test-user'})})};
    if(id === 'firebase-admin/firestore') return {getFirestore: () => db, FieldValue:{serverTimestamp: () => null}};
    if(id === 'firebase-functions') return {setGlobalOptions(){}};
    if(id === 'firebase-functions/https') return {onRequest: (_, fn) => fn};
    if(id === './ai') return {generateWellnessAdviceHandler: async () => {calls++; return {};}};
    return {};
  }});
  return {async request() {
    let status;
    const res = {status(n){status=n;return this;},json(){},send(){}};
    await exports.generateWellnessAdviceHttp({method:'POST',headers:{authorization:'Bearer test'},body:{question:'hello',dashboard:{todayStats:{waterMl:0,sleepMinutes:0,yogaMinutes:0,musicMinutes:0},wellnessScore:0}}},res);
    return {status,writes,calls,stored};
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
