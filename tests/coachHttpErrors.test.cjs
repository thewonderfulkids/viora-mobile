const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function fixture(responses, getAppCheckToken = async () => null) {
  const posts = [], logs = [], diagnostics = [];
  let errorBodiesRead = 0;
  const auth = { currentUser: { uid: 'fixture-account', getIdToken: async () => 'fixture-token' } };
  let id = 0;
  const timer = (fn, ms) => {
    if (ms < 1000) queueMicrotask(fn); // Expose any automatic short backoff without waiting.
    return ++id;
  };
  const globals = { Error, AbortController, setTimeout: timer, clearTimeout() {}, console: { warn: (...entry) => diagnostics.push(entry) } };
  function load(name, imports) {
    const src = fs.readFileSync(path.join(__dirname, '../src/services/ai', name + '.ts'), 'utf8');
    const exports = {};
    vm.runInNewContext(ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
      ...globals, exports, require(id) {
        assert.ok(Object.hasOwn(imports, id), 'Unexpected import ' + id);
        return imports[id];
      },
      async fetch(_url, options) {
        posts.push(JSON.parse(options.body));
        const outcome = responses[posts.length - 1];
        assert.notEqual(outcome, undefined, 'Unexpected automatic POST');
        if (outcome instanceof Error) throw outcome;
        const ok = outcome === 200;
        return { ok, status: outcome, json: async () => {
          if (ok) return { answer: '  A plan  ', model: 'fixture-model' };
          errorBodiesRead += 1;
          return { error: 'synthetic confidential provider diagnostics' };
        } };
      },
    });
    return exports;
  }
  const errors = load('aiErrors', {});
  const cloud = load('VioraCloudAIProvider', { '../../firebase/firebaseConfig': { auth }, '../../firebase/appCheckToken': { getVioraAppCheckToken: getAppCheckToken }, './aiErrors': errors });
  const service = load('AIService', { './VioraCloudAIProvider': cloud });
  const manager = load('requestManager', { './aiErrors': errors, './aiRequestLogService': { saveAIRequestLog: async entry => { logs.push(entry); } } });
  const remote = load('remoteAIService', { './AIService': service, './requestManager': manager });
  return {
    auth, posts, logs, diagnostics, errors, errorReads: () => errorBodiesRead,
    ask: () => remote.generateWellnessAdvice({
      question: 'आज का प्लान बना दो', expectedUid: 'fixture-account', dashboard: { todayStats: {} },
    }),
  };
}

for (const [status, code] of [[429, 'RATE_LIMIT'], [400, 'VALIDATION'], [401, 'AUTH'], [403, 'PROVIDER'], [503, 'PROVIDER']]) {
  test(`HTTP ${status} is classified and logged without replaying the POST or reading the server error body`, async () => {
    const f = fixture([status]);
    await assert.rejects(f.ask(), error => {
      assert.ok(error instanceof f.errors.AIError);
      assert.equal(error.status, status);
      assert.equal(error.code, code);
      assert.equal(error.requestId, f.logs[0].requestId);
      if (status === 429) assert.match(error.message, /request limit reached/i);
      return true;
    });
    assert.equal(f.posts.length, 1);
    assert.equal(f.errorReads(), 0);
    assert.equal(f.logs.length, 1);
    assert.equal(f.logs[0].errorCode, code);
    assert.doesNotMatch(JSON.stringify([f.logs, f.diagnostics]), /confidential/);
  });
}

test('lost transport response is not replayed automatically; explicit retry still sends the same question', async () => {
  const f = fixture([new Error('synthetic private transport detail'), 200]);
  await assert.rejects(f.ask(), error => error.code === 'NETWORK' && !error.message.includes('private transport'));
  assert.equal(f.posts.length, 1);
  assert.equal(await f.ask(), 'A plan');
  assert.deepEqual(f.posts[0], f.posts[1]);
  assert.deepEqual(f.logs.map(entry => entry.status), ['failed', 'success']);
});

test('expired or changed sign-in never makes a Coach POST', async () => {
  const f = fixture([]);
  f.auth.currentUser.getIdToken = async () => { throw Error('synthetic token error'); };
  await assert.rejects(f.ask(), error => error.code === 'AUTH');
  f.auth.currentUser = { uid: 'different-account' };
  await assert.rejects(f.ask(), error => error.code === 'AUTH');
  assert.equal(f.posts.length, 0);
});

test('a timed-out POST is classified once and waits for the user to retry', async () => {
  const f = fixture([Object.assign(Error('abort'), { name: 'AbortError' })]);
  await assert.rejects(f.ask(), error => error.code === 'TIMEOUT');
  assert.equal(f.posts.length, 1);
  assert.equal(f.logs[0].errorCode, 'TIMEOUT');
});

test('H08 attestation failure never sends a Coach POST or exposes provider diagnostics', async () => {
  const f = fixture([], async () => { throw Error('synthetic confidential attestation detail'); });
  await assert.rejects(f.ask(), error => error.code === 'AUTH' && !error.message.includes('confidential'));
  assert.equal(f.posts.length, 0);
  assert.equal(f.logs.length, 1);
  assert.equal(f.logs[0].errorCode, 'AUTH');
  assert.doesNotMatch(JSON.stringify([f.logs, f.diagnostics]), /confidential/);
});
