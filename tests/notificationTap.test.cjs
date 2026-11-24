const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function fixture() {
  const auth = { currentUser: { uid: 'account-a' } };
  const jobs = new Map();
  const store = new Map();
  const routes = [];
  const handlers = new Set();
  let serial = 0;
  let cleanup;
  let lastResponse = null;
  let failWrite = false;
  const notifications = {
    AndroidImportance: {}, AndroidNotificationPriority: {}, AndroidNotificationVisibility: {},
    SchedulableTriggerInputTypes: { WEEKLY: 'weekly', TIME_INTERVAL: 'interval' },
    setNotificationHandler() {},
    setNotificationChannelAsync: async () => {},
    getPermissionsAsync: async () => ({ granted: true }),
    scheduleNotificationAsync: async (task) => {
      const id = 'job-' + ++serial;
      jobs.set(id, task);
      return id;
    },
    cancelScheduledNotificationAsync: async (id) => { jobs.delete(id); },
    addNotificationResponseReceivedListener: (callback) => {
      handlers.add(callback);
      return { remove: () => handlers.delete(callback) };
    },
    getLastNotificationResponseAsync: async () => lastResponse,
  };
  function load(file) {
    const exports = {};
    const js = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(js, { exports, require(id) {
      if (id === 'expo-notifications') return notifications;
      if (id === 'react-native') return { Platform: { OS: 'android' } };
      if (id === 'expo-router') return { router: { push: route => routes.push(route) } };
      if (id === 'react') return { useEffect: cb => { cleanup = cb(); }, useRef: current => ({ current }) };
      if (id.endsWith('/AuthContext')) return { useAuth: () => ({ user: auth.currentUser }) };
      if (id.endsWith('/firebaseConfig')) return { auth };
      if (id.endsWith('/nativeNotificationService')) return { initializeNativeNotificationRuntime: async () => {} };
      if (id === './messages') return { getRotatingReminderBody: () => 'Reminder' };
      if (id === '@react-native-async-storage/async-storage') return { __esModule: true, default: {
        getItem: async k => store.get(k), setItem: async (k, v) => {
          if (failWrite) throw Error("storage unavailable");
          store.set(k, v);
        },
      } };
      throw Error(id);
    } });
    return exports;
  }
  const asResponse = (identifier, data) => ({ notification: { request: { identifier, content: { data } } } });
  const premium = load('src/services/notifications2/premiumNotificationService.ts');
  const native = load('src/services/notifications/nativeNotificationService.ts');
  const { NotificationRuntime } = load('src/components/runtime/NotificationRuntime.tsx');
  return {
    auth, jobs, store, routes, notifications, premium, native,
    failWrites: () => { failWrite = true; },
    mount: () => NotificationRuntime(), unmount: () => cleanup?.(),
    last: (id, data) => { lastResponse = asResponse(id, data); },
    tap: (id, data = jobs.get(id).content.data) => handlers.forEach(cb => cb(asResponse(id, data))),
  };
}

const input = { hour: 17, minute: 25, weekdays: [2], enabled: true, sound: true, vibration: true };

test('premium producer and tap runtime agree for every actual destination', async () => {
  const f = fixture();
  f.mount();
  const pairs = {
    hydration: '/hydration', meditation: '/meditation', sleep: '/sleep', workout: '/home-workout',
    steps: '/steps', habit: '/goals-habits', morning: '/(tabs)', night: '/mental-wellness',
  };
  for (const [category, route] of Object.entries(pairs)) {
    const saved = await f.premium.upsertPremiumReminder({ ...input, category });
    const [id] = saved.notificationIds;
    const { data } = f.jobs.get(id).content;
    assert.equal(data.actionRoute, route);
    assert.equal(data.userId, 'account-a');
    f.tap(id);
    f.tap(id);
  }
  assert.deepEqual(f.routes, Object.values(pairs));
});

test('native test reminder uses the same ownership contract, including launch from a notification', async () => {
  const f = fixture();
  assert.equal(await f.native.scheduleWellnessTestNotification(), true);
  const [[id, job]] = f.jobs;
  f.last(id, job.content.data);
  f.mount();
  await Promise.resolve();
  f.tap(id);
  assert.deepEqual(f.routes, ['/smart-notifications']);
});

test('upgrade leaves ownerless schedules alone: no deep link, explicit resave restores it', async () => {
  const f = fixture();
  f.jobs.set('legacy', { content: { data: { deepLink: '/hydration', reminderId: 'r-old' } } });
  f.store.set('@viora/premium-reminders-v2', JSON.stringify([{ id: 'r-old', category: 'hydration', notificationIds: ['legacy'] }]));
  f.mount();
  f.tap('legacy');
  f.tap('legacy-test', { actionRoute: '/smart-notifications', vioraTest: true });
  assert.equal(f.jobs.has('legacy'), true);
  assert.deepEqual(f.routes, []);
  const saved = await f.premium.upsertPremiumReminder({ ...input, category: 'hydration', id: 'r-old' });
  assert.equal(f.jobs.has('legacy'), false);
  f.tap(saved.notificationIds[0]);
  assert.deepEqual(f.routes, ['/hydration']);
});

test('owner mismatch, invalid route, and unauthenticated tap never navigate', () => {
  const f = fixture();
  f.mount();
  f.tap('other', { actionRoute: '/steps', userId: 'account-b' });
  f.tap('invalid', { actionRoute: '/account-security', userId: 'account-a' });
  f.auth.currentUser = null;
  f.tap('signed-out', { actionRoute: '/steps', userId: 'account-a' });
  assert.deepEqual(f.routes, []);
});

test('account changes during scheduling discard the partial new native job', async () => {
  const f = fixture();
  const schedule = f.notifications.scheduleNotificationAsync;
  f.notifications.scheduleNotificationAsync = async task => {
    const id = await schedule(task);
    f.auth.currentUser = { uid: 'account-b' };
    return id;
  };
  await assert.rejects(f.premium.upsertPremiumReminder({ ...input, category: 'steps', weekdays: [2, 4] }), /Sign in again/);
  assert.equal(f.jobs.size, 0);
  assert.equal(f.store.size, 0);
  f.auth.currentUser = { uid: 'account-a' };
  assert.equal(await f.native.scheduleWellnessTestNotification(), false);
  assert.equal(f.jobs.size, 0);
});

test('an unsuccessful upgrade resave does not cancel the existing reminder', async () => {
  const f = fixture();
  f.jobs.set('legacy', { content: { data: { deepLink: '/hydration', reminderId: 'r-old' } } });
  f.store.set('@viora/premium-reminders-v2', JSON.stringify([{ id: 'r-old', notificationIds: ['legacy'] }]));
  f.failWrites();
  await assert.rejects(f.premium.upsertPremiumReminder({ ...input, category: 'hydration', id: 'r-old' }), /storage unavailable/);
  assert.deepEqual([...f.jobs.keys()], ['legacy']);
});
