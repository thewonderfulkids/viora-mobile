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
  const tray = new Map();
  const routes = [];
  const handlers = new Set();
  let serial = 0;
  const cleanups = [];
  let onAccountChange;
  let lastResponse = null;
  let failWrite = false, failRead = false;
  const notifications = {
    AndroidImportance: {}, AndroidNotificationPriority: {}, AndroidNotificationVisibility: {},
    SchedulableTriggerInputTypes: { WEEKLY: 'weekly', TIME_INTERVAL: 'interval' },
    setNotificationHandler() {},
    setNotificationChannelAsync: async () => {},
    getPermissionsAsync: async () => ({ granted: true }),
    getAllScheduledNotificationsAsync: async () => [...jobs].map(([identifier, task]) => ({ identifier, ...task })),
    getPresentedNotificationsAsync: async () => [...tray].map(([identifier, task]) => ({ request: { identifier, ...task } })),
    dismissNotificationAsync: async id => { tray.delete(id); },
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
      if (id === 'react-native') return { Platform: { OS: 'android' }, AppState: { addEventListener: () => ({ remove() {} }) } };
      if (id === 'firebase/auth') return { onAuthStateChanged: (_auth, cb) => { onAccountChange = cb; return () => { onAccountChange = null; }; } };
      if (id.endsWith('/premiumNotificationService')) return premium;
      if (id === 'expo-router') return { router: { push: route => routes.push(route) } };
      if (id === 'react') return { useEffect: cb => { cleanups.push(cb()); }, useRef: current => ({ current }) };
      if (id.endsWith('/AuthContext')) return { useAuth: () => ({ user: auth.currentUser }) };
      if (id.endsWith('/firebaseConfig')) return { auth };
      if (id.endsWith('/nativeNotificationService')) return { initializeNativeNotificationRuntime: async () => {} };
      if (id === './messages') return { getRotatingReminderBody: () => 'Reminder' };
      if (id === '@react-native-async-storage/async-storage') return { __esModule: true, default: {
        getItem: async k => { if (failRead) throw Error("read unavailable"); return store.get(k); }, setItem: async (k, v) => {
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
    auth, jobs, tray, store, routes, notifications, premium, native,
    notifyAuth: () => onAccountChange?.(auth.currentUser),
    failReads: () => { failRead = true; },
    failWrites: () => { failWrite = true; },
    mount: () => NotificationRuntime(), unmount: () => cleanups.forEach(cleanup => cleanup?.()),
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

test('upgrade cancels identifiable old Premium jobs but never adopts their ownerless configuration', async () => {
  const f = fixture();
  const legacy = { content: { data: { deepLink: '/hydration', reminderId: 'r-old' } } };
  f.jobs.set('legacy', legacy);
  f.tray.set('legacy', legacy);
  f.store.set('@viora/premium-reminders-v2', JSON.stringify([{ id: 'r-old', category: 'hydration', notificationIds: ['legacy'] }]));
  f.jobs.set('unrelated', { content: { data: { vioraReminderId: 'not-premium' } } });
  f.mount();
  f.tap('legacy');
  f.tap('legacy-test', { actionRoute: '/smart-notifications', vioraTest: true });
  assert.deepEqual(f.routes, []);
  f.notifyAuth();
  await f.premium.reconcilePremiumNotificationSession();
  assert.equal(f.jobs.has('legacy'), false);
  assert.equal(f.tray.has('legacy'), false);
  assert.equal(f.jobs.has('unrelated'), true);
  assert.equal(f.store.has('@viora/premium-reminders-v2'), true);
  assert.equal((await f.premium.getPremiumReminders()).length, 0);
  await assert.rejects(f.premium.upsertPremiumReminder({ ...input, category: 'hydration', id: 'r-old' }), /not available/);
  const saved = await f.premium.upsertPremiumReminder({ ...input, category: 'hydration' });
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

test('an unsuccessful account-scoped edit leaves the existing reminder intact', async () => {
  const f = fixture();
  const initial = await f.premium.upsertPremiumReminder({ ...input, category: 'hydration' });
  f.failWrites();
  await assert.rejects(f.premium.upsertPremiumReminder({ ...input, category: 'hydration', id: initial.id }), /storage unavailable/);
  assert.deepEqual([...f.jobs.keys()], [...initial.notificationIds]);
});

test('Premium list, settings, analytics and edit/delete stay within account; jobs and tray clear on sign-out', async () => {
  const f = fixture();
  const initial = await f.premium.upsertPremiumReminder({ ...input, category: 'steps' });
  await f.premium.savePremiumNotificationSettings({ quietHoursEnabled: false, quietStartHour: 21, quietEndHour: 9 });
  assert.equal((await f.premium.getReminderAnalytics()).length, 1);
  for (const [id, job] of f.jobs) f.tray.set(id, job);
  f.auth.currentUser = null;
  assert.equal((await f.premium.getPremiumReminders()).length, 0);
  assert.equal((await f.premium.getReminderAnalytics()).length, 0);
  await f.premium.reconcilePremiumNotificationSession();
  assert.equal(f.jobs.size, 0);
  assert.equal(f.tray.size, 0);
  f.auth.currentUser = { uid: 'account-b' };
  assert.equal((await f.premium.getPremiumReminders()).length, 0);
  assert.equal((await f.premium.getReminderAnalytics()).length, 0);
  assert.equal((await f.premium.getPremiumNotificationSettings()).quietHoursEnabled, true);
  await f.premium.deletePremiumReminder(initial.id);
  await assert.rejects(f.premium.upsertPremiumReminder({ ...input, category: 'steps', id: initial.id }), /not available/);
  const second = await f.premium.upsertPremiumReminder({ ...input, category: 'meditation' });
  f.tray.set(second.notificationIds[0], f.jobs.get(second.notificationIds[0]));
  f.auth.currentUser = { uid: 'account-a' };
  assert.equal((await f.premium.getPremiumNotificationSettings()).quietHoursEnabled, false);
  assert.equal((await f.premium.getPremiumReminders())[0].id, initial.id);
  await f.premium.reconcilePremiumNotificationSession();
  assert.equal(f.tray.size, 0);
  const [jobId] = [...f.jobs.keys()];
  assert.equal(f.jobs.size, 1);
  assert.equal(f.jobs.get(jobId).content.data.userId, 'account-a');
  assert.equal((await f.premium.getPremiumReminders())[0].notificationIds[0], jobId);
  await f.premium.reconcilePremiumNotificationSession();
  assert.deepEqual([...f.jobs.keys()], [jobId]);
});

test('disabled reminders and starter rows need no permission and restore no jobs', async () => {
  const f = fixture();
  f.notifications.getPermissionsAsync = async () => { throw Error('must not request'); };
  await f.premium.seedRecommendedReminders();
  assert.equal((await f.premium.getPremiumReminders()).length, 4);
  const saved = await f.premium.upsertPremiumReminder({ ...input, category: 'night', hour: 22, enabled: false });
  assert.equal(saved.enabled, false);
  await f.premium.reconcilePremiumNotificationSession();
  assert.equal(f.jobs.size, 0);
});

test('a stale screen cannot save into a new session of the same UID', async () => {
  const f = fixture();
  const old = f.auth.currentUser;
  f.auth.currentUser = { uid: old.uid };
  await assert.rejects(f.premium.upsertPremiumReminder({ ...input, category: 'steps' }, old), /Sign in again/);
  await assert.rejects(f.premium.savePremiumNotificationSettings({ quietHoursEnabled: false }, old), /Sign in again/);
  assert.equal(f.jobs.size, 0);
  assert.equal(f.store.size, 0);
});

test('known other-account native jobs and tray entries clear even if local settings cannot be read', async () => {
  const f = fixture();
  const saved = await f.premium.upsertPremiumReminder({ ...input, category: 'steps' });
  const [id] = saved.notificationIds;
  f.tray.set(id, f.jobs.get(id));
  f.auth.currentUser = { uid: 'account-b' };
  f.failReads();
  await f.premium.reconcilePremiumNotificationSession();
  assert.equal(f.jobs.size, 0);
  assert.equal(f.tray.size, 0);
});
