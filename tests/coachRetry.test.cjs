const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 };
function load(path, imports) {
  const module = { exports: {} };
  const source = readFileSync(join(__dirname, '..', path), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions }).outputText, {
    exports: module.exports, require(id) {
      assert.ok(Object.hasOwn(imports, id), `Unexpected module ${id}`);
      return imports[id];
    },
  });
  return module.exports;
}

function fixture() {
  const state = [], refs = [], stored = [], providerCalls = [];
  let stateCursor = 0, refCursor = 0, failedModelCalls = 1, failedUserSaves = 0, authListener, deferredHistory;
  const auth = { currentUser: { uid: 'alice' } };
  const repository = {
    async saveAICoachMessage(message) {
      if (message.role === 'user' && failedUserSaves > 0) {
        failedUserSaves--;
        throw Error('save unavailable');
      }
      stored.push(message);
    },
    async getAICoachThreads() { throw Error('history refresh unavailable'); },
    async getAICoachLatestHistory() { if (deferredHistory) { const pending = deferredHistory; deferredHistory = null; return pending; } return { messages: [{ id: 'private', role: 'user', message: 'Alice private history', conversationId: 'alice-conv' }], threads: [] }; },
    async getAICoachConversation() { return [{ id: 'private', role: 'user', message: 'Alice private history' }]; },
  };
  const service = load('src/services/ai/contextAwareCoachService.ts', {
    '../activity': { ActivityLogger: { aiChat: async () => { throw Error('activity unavailable'); } } },
    '../../repositories/aiCoachRepository': repository,
    './coachContextService': { buildAICoachContextBundle: async () => ({ contextSnapshot: {}, quickActions: [], followUps: [] }) },
    './coachPromptBuilder': { buildContextAwareCoachPrompt: ({ question }) => question },
    './memoryIntelligenceService': { processConversationMemory: async () => {} },
    './conversationSummaryService': { processConversationSummary: async () => {} },
    './remoteAIService': { generateWellnessAdvice: async ({ question }) => {
      providerCalls.push(question);
      if (failedModelCalls > 0) { failedModelCalls--; throw Error('model unavailable'); }
      return 'synthetic coach reply';
    } },
  });
  const { useAICoach } = load('src/hooks/useAICoach.ts', {
    'firebase/auth': { onAuthStateChanged(_auth, cb) { authListener = cb; return () => {}; } },
    './useDashboard': { useDashboard: () => ({ data: {} }) },
    '../firebase/firebaseConfig': { auth },
    '../repositories/aiCoachRepository': repository,
    '../services/ai/contextAwareCoachService': service,
    react: {
      useCallback: fn => fn, useEffect(fn) { if (!authListener) fn(); },
      useRef(initial) { const index = refCursor++; return refs[index] ?? (refs[index] = { current: initial }); },
      useState(initial) {
        const index = stateCursor++;
        if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
        return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
      },
    },
  });
  return { auth, stored, providerCalls, deferHistory() { let resolve; deferredHistory = new Promise(r => { resolve = r; }); return resolve; }, notifyAuth: () => authListener(auth.currentUser), failNextUserSave: () => { failedUserSaves++; }, render() { stateCursor = refCursor = 0; return useAICoach(); } };
}

test('model failure then Retry produces one persisted and visible question and answer; deliberate repeats stay separate', async () => {
  const f = fixture();
  const question = 'आज का प्लान बना दो';
  await assert.rejects(f.render().askWellnessCoach(question), /model unavailable/);
  assert.equal(f.render().messages.length, 1);
  assert.equal(f.stored.length, 1);
  // A caller replaying the same displayed text on Retry must not create a new turn.
  await f.render().askWellnessCoach(question, { retry: true });
  assert.deepEqual(f.providerCalls, [question, question]);
  assert.equal(f.render().messages.length, 2);
  assert.equal(f.stored.map(x => x.role).join(','), 'user,assistant');
  assert.equal(f.render().retryAvailable, false);
  await f.render().askWellnessCoach(question, { retry: true });
  assert.equal(f.providerCalls.length, 2);
  await f.render().askWellnessCoach(question);
  assert.equal(f.render().messages.length, 4);
  assert.equal(f.stored.map(x => x.role).join(','), 'user,assistant,user,assistant');
});

test('Retry persists a question after its first write fails before acknowledgment', async () => {
  const f = fixture();
  f.failNextUserSave();
  await assert.rejects(f.render().askWellnessCoach('question'), /save unavailable/);
  assert.equal(f.stored.length, 0);
  await assert.rejects(f.render().askWellnessCoach(undefined, { retry: true }), /model unavailable/);
  assert.equal(f.stored.length, 1);
  await f.render().askWellnessCoach(undefined, { retry: true });
  assert.equal(f.render().messages.length, 2);
  assert.equal(f.stored.map(x => x.role).join(','), 'user,assistant');
});

test('Retry cannot continue across accounts or a newly opened conversation', async () => {
  const f = fixture();
  await assert.rejects(f.render().askWellnessCoach('first turn'), /model unavailable/);
  f.auth.currentUser = { uid: 'bob' };
  await f.render().askWellnessCoach(undefined, { retry: true });
  f.auth.currentUser = { uid: 'alice' };
  f.render().startNewConversation();
  await f.render().askWellnessCoach(undefined, { retry: true });
  assert.equal(f.stored.length, 1);
  assert.equal(f.providerCalls.length, 1);
});


test('history reads started by Alice cannot populate Bob’s coach after account switch', async () => {
  const f = fixture();
  const latest = f.render().reloadHistory();
  f.auth.currentUser = { uid: 'bob' };
  await latest;
  assert.equal(f.render().messages.length, 0);
  f.auth.currentUser = { uid: 'alice' };
  const opened = f.render().openConversation('alice-conv');
  f.auth.currentUser = { uid: 'bob' };
  await opened;
  assert.equal(f.render().messages.length, 0);
});


test('Dashboard clears prior account data and ignores stale success and failure', async () => {
  const state = [], refs = [], requests = [];
  let sc = 0, rc = 0, listener, cleanup;
  const auth = { currentUser: { uid: 'alice' } };
  const { useDashboard } = load('src/hooks/useDashboard.ts', {
    'firebase/auth': { onAuthStateChanged(_auth, cb) { listener = cb; return () => {}; } },
    '../firebase/firebaseConfig': { auth },
    '../services/dashboardService': { getDashboardData(uid) {
      return new Promise((resolve, reject) => requests.push({ uid, resolve, reject }));
    } },
    react: {
      useEffect(fn) { if (!cleanup) cleanup = fn(); },
      useRef(initial) { const i = rc++; return refs[i] ?? (refs[i] = { current: initial }); },
      useState(initial) {
        const i = sc++;
        if (!(i in state)) state[i] = initial;
        return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }];
      },
    },
  });
  const render = () => { sc = rc = 0; return useDashboard(); };
  render();
  listener(auth.currentUser);
  requests[0].resolve({ owner: 'alice' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(render().data.owner, 'alice');
  const staleSuccess = render().refresh();
  const staleFailure = render().refresh();
  auth.currentUser = { uid: 'bob' };
  listener(auth.currentUser);
  assert.equal(render().data, null);
  assert.equal(render().loading, true);
  requests[3].resolve({ owner: 'bob' });
  await new Promise(resolve => setImmediate(resolve));
  requests[1].resolve({ owner: 'alice' });
  requests[2].reject(Error('Alice private error'));
  await Promise.all([staleSuccess, staleFailure]);
  assert.equal(render().data.owner, 'bob');
  assert.equal(render().error, null);
  const pending = render().refresh();
  cleanup();
  requests[4].resolve({ owner: 'unexpected' });
  await pending;
  assert.equal(render().data.owner, 'bob');
});


test('auth listener clears loaded coach messages and retry state on sign-out', async () => {
  const f = fixture();
  await f.render().reloadHistory();
  assert.equal(f.render().messages.length, 1);
  await assert.rejects(f.render().askWellnessCoach('private question'), /model unavailable/);
  assert.equal(f.render().retryAvailable, true);
  f.auth.currentUser = null;
  f.notifyAuth();
  const coach = f.render();
  assert.equal(coach.messages.length, 0);
  assert.equal(coach.threads.length, 0);
  assert.equal(coach.contextSnapshot, null);
  assert.equal(coach.retryAvailable, false);
  assert.equal(coach.loading, false);
});

test('stale history cannot overwrite a new Alice session after Alice-Bob-Alice', async () => {
  const f = fixture();
  const resolveStale = f.deferHistory();
  const stale = f.render().reloadHistory();
  f.auth.currentUser = { uid: 'bob' };
  f.notifyAuth();
  f.auth.currentUser = { uid: 'alice' };
  f.notifyAuth();
  await new Promise(resolve => setImmediate(resolve));
  f.render().startNewConversation();
  resolveStale({ messages: [{ id: 'stale', role: 'user', message: 'old session', conversationId: 'old' }], threads: [] });
  await stale;
  assert.equal(f.render().messages.length, 0);
  assert.equal(f.render().retryAvailable, false);
  assert.equal(f.render().historyLoading, false);
});
