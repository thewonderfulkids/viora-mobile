// Regression coverage for account-scoped offline queue and concurrent mutations.
// Run with: node --test tests/syncQueueRepository.test.cjs (after npm ci)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup({ onGetItem, onSetItem } = {}) {
  const storage = new Map();
  const auth = { currentUser: { uid: 'alice' } };
  const asyncStorage = {
    async getItem(key) { await Promise.resolve(); if (onGetItem) await onGetItem(key); return storage.get(key) ?? null; },
    async setItem(key, value) { await Promise.resolve(); if (onSetItem) await onSetItem(key, value); storage.set(key, value); },
    async removeItem(key) { await Promise.resolve(); storage.delete(key); },
  };
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/repositories/syncQueueRepository.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    reportDiagnostics: true,
  });
  assert.equal(compiled.diagnostics.length, 0);
  const module = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module, exports: module.exports, Date, Promise, Error, JSON,
    require(id) {
      if (id === '@react-native-async-storage/async-storage') return asyncStorage;
      if (id === '../firebase/firebaseConfig') return { auth };
      throw new Error('Unexpected import: ' + id);
    },
  }, { filename: 'syncQueueRepository.js' });
  return { repo: module.exports, storage, auth };
}
function action(id, userId = 'alice') {
  return { id, userId, updatedAt: new Date().toISOString(), status: 'pending' };
}
test('simultaneous saves preserve both actions', async () => {
  const { repo } = setup();
  await Promise.all([
    repo.savePendingSyncAction(action('first')),
    repo.savePendingSyncAction(action('second')),
  ]);
  assert.deepEqual(Array.from((await repo.getPendingSyncActions()).map(x => x.id)).sort(), ['first', 'second']);
});
test('switching accounts isolates queues and rejects cross-owner saves', async () => {
  const { repo, auth } = setup();
  await repo.savePendingSyncAction(action('alice-action'));
  auth.currentUser = { uid: 'bob' };
  assert.equal((await repo.getPendingSyncActions()).length, 0);
  await assert.rejects(repo.savePendingSyncAction(action('wrong-owner')), /owner/);
  await repo.savePendingSyncAction(action('bob-action', 'bob'));
  assert.deepEqual(Array.from((await repo.getPendingSyncActions()).map(x => x.id)), ['bob-action']);
  auth.currentUser = { uid: 'alice' };
  assert.deepEqual(Array.from((await repo.getPendingSyncActions()).map(x => x.id)), ['alice-action']);
});
test('corrupted queue is never silently overwritten', async () => {
  const { repo, storage } = setup();
  storage.set('@viora/sync-queue/v2/alice', '{bad json');
  await assert.rejects(repo.savePendingSyncAction(action('new')), /unreadable/);
  assert.equal(storage.get('@viora/sync-queue/v2/alice'), '{bad json');
});

test('a rejected cross-owner mutation does not block later valid saves', async () => {
  const { repo } = setup();
  await assert.rejects(repo.savePendingSyncAction(action('foreign', 'bob')), /owner/);
  await repo.savePendingSyncAction(action('valid'));
  assert.deepEqual(Array.from((await repo.getPendingSyncActions()).map(x => x.id)), ['valid']);
});

test('queue owner cannot be changed through a patch', async () => {
  const { repo } = setup();
  await repo.savePendingSyncAction(action('original'));
  await assert.rejects(repo.updatePendingSyncAction('original', { userId: 'bob' }), /owner/);
  const queue = await repo.getPendingSyncActions();
  assert.equal(queue.length, 1);
  assert.equal(queue[0].userId, 'alice');
});


test('account switch during asynchronous queue read rejects stale results', async () => {
  let authRef;
  const { repo, storage, auth } = setup({ onGetItem: async () => {
    if (authRef) authRef.currentUser = { uid: 'bob' };
  } });
  const original = JSON.stringify([action('private-alice')]);
  storage.set('@viora/sync-queue/v2/alice', original);
  authRef = auth;
  await assert.rejects(repo.getPendingSyncActions(), /Account changed/);
  assert.equal(storage.get('@viora/sync-queue/v2/alice'), original);
});

test('account switch during queue write rejects success and preserves owner isolation', async () => {
  let authRef;
  const { repo, storage, auth } = setup({ onSetItem: async () => {
    authRef.currentUser = { uid: 'bob' };
  } });
  authRef = auth;
  const bobOriginal = JSON.stringify([action('bob-existing', 'bob')]);
  storage.set('@viora/sync-queue/v2/bob', bobOriginal);
  await assert.rejects(repo.savePendingSyncAction(action('alice-pending')), /Account changed while saving/);
  assert.equal(storage.get('@viora/sync-queue/v2/bob'), bobOriginal);
  assert.equal(JSON.parse(storage.get('@viora/sync-queue/v2/alice'))[0].id, 'alice-pending');
  assert.deepEqual(Array.from((await repo.getPendingSyncActions()).map(x => x.id)), ['bob-existing']);
});

test('H04 cleanup removes only empty legacy queue', async () => {
  const {repo,storage} = setup(); const k='@viora/sync-queue/v1';
  for(const raw of ['{bad', JSON.stringify([action('old')]), '[{}]']) {
    storage.set(k,raw); assert.equal(await repo.cleanupEmptyLegacySyncQueue(),false); assert.equal(storage.get(k),raw);
  }
  storage.set(k,'[]'); assert.equal(await repo.cleanupEmptyLegacySyncQueue(),true);
  assert.equal(storage.has(k),false); assert.equal(await repo.cleanupEmptyLegacySyncQueue(),false);
});
test('H04 cleanup aborts on account change', async () => {
  let actor; const {repo,storage,auth}=setup({onGetItem:async()=>{actor.currentUser={uid:'bob'};}}); actor=auth;
  const k='@viora/sync-queue/v1'; storage.set(k,'[]');
  await assert.rejects(repo.cleanupEmptyLegacySyncQueue(),/Account changed/); assert.equal(storage.get(k),'[]');
});
