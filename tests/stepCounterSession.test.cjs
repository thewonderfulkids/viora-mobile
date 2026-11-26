const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/services/steps/stepCounterService.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const key = (owner, suffix) => '@viora/steps/by-user/' + owner + '/' + suffix;
const date = '2026-11-24';
const flush = () => new Promise(setImmediate);
function defer() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

function fixture() {
  const store = new Map([
    [key('A','daily/' + date), '1234'], [key('A','goal'), '9000'],
    [key('B','daily/' + date), '45'], [key('B','goal'), '6000'],
    ['@viora/steps/daily/' + date, '6644'], ['@viora/steps/goal', '12000'],
  ]);
  const events = [], writes = [], reads = [];
  const auth = { currentUser: null };
  const observers = new Set(), appListeners = new Set();
  const app = { currentState: 'active', addEventListener: (_, listener) => {
    appListeners.add(listener); return { remove: () => appListeners.delete(listener) };
  } };
  const io = {
    getItem: async name => { reads.push(name); return store.get(name); },
    setItem: async (name, value) => { writes.push([name, value]); store.set(name, value); },
  };
  let now = new Date(2026, 10, 24, 23, 59, 40);
  const timers = new Map();
  let timerId = 0;
  let granted = true;
  const permission = () => ({ granted, status: granted ? 'granted' : 'denied' });
  const pedometer = {
    isAvailableAsync: async () => true, getPermissionsAsync: async () => permission(),
    requestPermissionsAsync: async () => permission(),
    watchStepCount(callback) {
      const event = { callback, live: true };
      events.push(event);
      return { remove: () => { event.live = false; } };
    },
  };
  const m = { exports: {} };
  vm.runInNewContext(code, {
    exports: m.exports,
    Date: class extends Date { constructor() { super(now); } static now() { return now.getTime(); } },
    setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, {fn, due: now.getTime() + delay}); return id; },
    clearTimeout: id => timers.delete(id),
    require(id) {
      if (id === 'firebase/auth') return { onAuthStateChanged: (_, listener) => {
        observers.add(listener); queueMicrotask(() => { if (observers.has(listener)) listener(auth.currentUser); });
        return () => observers.delete(listener);
      } };
      if (id.endsWith('/firebaseConfig')) return { auth };
      if (id === 'expo-sensors') return { Pedometer: pedometer };
      if (id === 'react-native') return { AppState: app, Platform: { OS: 'android' } };
      if (id === '@react-native-async-storage/async-storage') return { __esModule: true, default: io };
      throw Error(id);
    },
  });
  const move = owner => {
    auth.currentUser = owner ? { uid: owner } : null;
    observers.forEach(listener => listener(auth.currentUser));
  };
  return {
    svc: m.exports, move, store, io, writes, reads, events, auth,
    active: () => events.filter(e => e.live),
    timers,
    tick() { for (const [id, timer] of [...timers]) if (timer.due <= now.getTime()) { timers.delete(id); timer.fn(); } },
    midnight: () => { now = new Date(2026, 10, 25, 0, 0, 2); },
    appState(next) { app.currentState = next; appListeners.forEach(listener => listener(next)); },
    allow(next) { granted = next; },
  };
}

test('A → signed out → B resets immediately; late callbacks and goal writes cannot change B', async () => {
  const f = fixture(), observed = [];
  f.move('A');
  const unsubscribe = f.svc.subscribeToStepCounter(s => observed.push(s));
  await flush();
  const [watchA] = f.active();
  assert.equal(f.svc.getStepCounterSnapshot('A').steps, 1234);
  watchA.callback({ steps: 10 });
  const delayed = defer();
  const set = f.io.setItem;
  f.io.setItem = async (k, v) => { if (k === key('A','goal')) await delayed.promise; return set(k, v); };
  const save = f.svc.setDailyStepGoal(10000, 'A');
  await flush();
  f.move(null);
  assert.equal(observed.at(-1).steps, 0);
  assert.equal(f.active().length, 0);
  f.move('B');
  assert.equal(f.svc.getStepCounterSnapshot('B').steps, 0);
  watchA.callback({ steps: 200 });
  await flush();
  assert.equal(f.svc.getStepCounterSnapshot('B').steps, 45);
  assert.equal(f.svc.getStepCounterSnapshot('B').goal, 6000);
  assert.equal(f.active().length, 1);
  delayed.resolve(); await save;
  assert.equal(f.svc.getStepCounterSnapshot('B').goal, 6000);
  f.move('A'); await flush();
  assert.equal(f.svc.getStepCounterSnapshot('A').steps, 1244);
  assert.equal(f.svc.getStepCounterSnapshot('A').goal, 10000);
  unsubscribe();
  assert.equal(f.active().length, 0);
});

test('stale storage read after switch cannot replace B or import ownerless keys', async () => {
  const f = fixture(), delayed = defer();
  const get = f.io.getItem;
  f.io.getItem = async k => { if (k === key('A','daily/' + date)) await delayed.promise; return get(k); };
  f.move('A');
  const unsubscribe = f.svc.subscribeToStepCounter(() => {});
  await flush();
  f.move(null); f.move('B'); await flush();
  delayed.resolve(); await flush();
  assert.equal(f.svc.getStepCounterSnapshot('B').steps, 45);
  assert.equal(f.svc.getStepCounterSnapshot('B').goal, 6000);
  f.move('new-user'); await flush();
  assert.equal(f.svc.getStepCounterSnapshot('new-user').steps, 0);
  assert.equal(f.svc.getStepCounterSnapshot('new-user').goal, 8000);
  assert.ok(f.reads.every(k => k.startsWith('@viora/steps/by-user/')));
  unsubscribe();
});

test('foreground midnight rolls the first new-day delta into the new key without a duplicate watch', async () => {
  const f = fixture(), delayed = defer();
  const nextKey = key('A','daily/2026-11-25');
  f.store.set(nextKey, '4');
  const get = f.io.getItem;
  f.io.getItem = async k => { if (k === nextKey) await delayed.promise; return get(k); };
  f.move('A');
  const unsubscribe = f.svc.subscribeToStepCounter(() => {});
  await flush();
  const [watch] = f.active();
  watch.callback({ steps: 10 });
  await flush();
  f.midnight();
  watch.callback({ steps: 16 });
  watch.callback({ steps: 18 });
  assert.equal(f.svc.getStepCounterSnapshot('A').dateKey, '2026-11-25');
  delayed.resolve();
  await f.svc.refreshStepCounter('A');
  await flush();
  assert.equal(f.store.get(key('A','daily/' + date)), '1244');
  assert.equal(f.store.get(nextKey), '12');
  assert.equal(f.svc.getStepCounterSnapshot('A').steps, 12);
  assert.deepEqual(f.active(), [watch]);
  unsubscribe();
});

test('resume/refresh rechecks revoked permission and ignores callbacks after backgrounding', async () => {
  const f = fixture();
  f.move('A');
  const unsubscribe = f.svc.subscribeToStepCounter(() => {});
  await flush();
  const [watch] = f.active();
  f.appState('background');
  f.allow(false);
  watch.callback({ steps: 99 });
  f.appState('active'); await flush();
  assert.equal(f.svc.getStepCounterSnapshot('A').permission, 'denied');
  assert.equal(f.active().length, 0);
  assert.equal(f.svc.getStepCounterSnapshot('A').steps, 1234);
  f.allow(true);
  await f.svc.refreshStepCounter('A');
  assert.equal(f.active().length, 1);
  unsubscribe();
});

test('a buffered midnight event remains with A when storage resolves after account switch', async () => {
  const f = fixture(), pending = defer();
  const today = key('A','daily/2026-11-25');
  f.store.set(today, '3');
  const get = f.io.getItem;
  f.io.getItem = async k => { if (k === today) await pending.promise; return get(k); };
  f.move('A');
  const unsubscribe = f.svc.subscribeToStepCounter(() => {});
  await flush();
  const [watch] = f.active();
  watch.callback({ steps: 10 });
  f.midnight();
  watch.callback({ steps: 16 });
  f.move('B');
  await flush();
  pending.resolve();
  await flush();
  assert.equal(f.store.get(today), '9');
  assert.equal(f.svc.getStepCounterSnapshot('B').steps, 0);
  f.move('A');
  await flush();
  assert.equal(f.svc.getStepCounterSnapshot('A').steps, 9);
  unsubscribe();
});

test('midnight timer loads new day without sensor events and clears on background or unsubscribe', async () => {
  const f = fixture();
  f.move('A');
  const unsubscribe = f.svc.subscribeToStepCounter(() => {});
  await flush();
  assert.equal(f.timers.size, 1);
  f.midnight(); f.tick(); await flush();
  assert.equal(f.svc.getStepCounterSnapshot('A').dateKey, '2026-11-25');
  assert.equal(f.svc.getStepCounterSnapshot('A').steps, 0);
  assert.equal(f.active().length, 1);
  f.appState('background'); assert.equal(f.timers.size, 0);
  f.appState('active'); await flush(); assert.equal(f.timers.size, 1);
  unsubscribe(); assert.equal(f.timers.size, 0);
});
