const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    exports: module.exports, require(name) {
      assert.ok(Object.hasOwn(imports, name), 'Unexpected import: ' + name);
      return imports[name];
    }, ...globals,
  });
  return module.exports;
}

function setup() {
  const outgoing = [], prompts = [];
  const quotas = new Map();
  const user = { uid: 'synthetic-member', getIdToken: async () => 'fixture-token' };
  const auth = { currentUser: user };
  const admin = Object.fromEntries([
    './admin/bootstrapFirstAdmin','./admin/createDefaultAdmin','./admin/premiumAccessGrants',
    './accountDeletion/requestAccountDeletion','./accountDeletion/previewAccountDeletion',
    './accountDeletion/deletionPreflight','./accountDeletion/discoverDeletionDataPaths',
  ].map(name => [name, {}]));
  const promptBuilder = load('functions/src/ai/promptBuilder.ts', {});
  const handler = load('functions/src/ai/wellness.ts', {
    './promptBuilder': promptBuilder,
    'firebase-functions/https': { HttpsError: Error },
    './client': { getOpenAIClient: () => ({
      responses: { create: async (input) => {
        prompts.push(input.input);
        return { output_text: 'synthetic model reply' };
      } },
    }) },
  }, { process: { env: { OPENAI_MODEL: 'synthetic-model' } } });
  const endpoint = load('functions/src/index.ts', {
    ...admin,
    './ai': handler,
    'firebase-admin/app': { initializeApp() {} },
    'firebase-admin/auth': { getAuth: () => ({ verifyIdToken: async (token) => {
      assert.equal(token, 'fixture-token');
      return { uid: user.uid };
    } }) },
    'firebase-admin/firestore': {
      FieldValue: { serverTimestamp: () => null },
      getFirestore: () => ({
        collection: name => ({ doc: uid => name + '/' + uid }),
        runTransaction: async run => run({
          get: async key => ({ data: () => quotas.get(key) }),
          set: (key, value) => quotas.set(key, value),
        }),
      }),
    },
    'firebase-functions': { setGlobalOptions() {} },
    'firebase-functions/https': { onRequest: (_options, fn) => fn },
  }, { console: { error() {} } }).generateWellnessAdviceHttp;
  async function post(body, headers = { authorization: 'Bearer fixture-token' }) {
    let status, result;
    await endpoint({ method: 'POST', headers, body }, {
      status(code) { status = code; return this; },
      json(value) { result = value; },
    });
    return { status, result };
  }
  const cloud = load('src/services/ai/VioraCloudAIProvider.ts', {
    '../../firebase/firebaseConfig': { auth },
  }, {
    setTimeout, clearTimeout, AbortController,
    async fetch(_url, init) {
      const body = JSON.parse(init.body);
      outgoing.push(body);
      const { status, result } = await post(body, { authorization: init.headers.Authorization });
      return { ok: status === 200, json: async () => result };
    },
  });
  const ai = load('src/services/ai/AIService.ts', { './VioraCloudAIProvider': cloud });
  const remote = load('src/services/ai/remoteAIService.ts', {
    './AIService': ai,
    './requestManager': { runManagedAIRequest: async ({ execute }) => ({ data: await execute() }) },
  });
  const service = load('src/services/ai/contextAwareCoachService.ts', {
    '../activity': { ActivityLogger: { aiChat: async () => {} } },
    '../../repositories/aiCoachRepository': { saveAICoachMessage: async () => {} },
    './coachContextService': { buildAICoachContextBundle: async () => ({}) },
    './coachPromptBuilder': { buildContextAwareCoachContext: () => 'c'.repeat(3499) + '😀 extra' },
    './memoryIntelligenceService': { processConversationMemory: async () => {} },
    './conversationSummaryService': { processConversationSummary: async () => {} },
    './remoteAIService': remote,
  });
  return { auth, post, service, outgoing, prompts };
}

const dashboard = { todayStats: { waterMl: 300, sleepMinutes: 400, yogaMinutes: 0, musicMinutes: 0 }, wellnessScore: 62 };
test('short Hindi Coach question and bounded context cross the actual app/HTTP/provider contract', async () => {
  const f = setup();
  const question = 'आज का प्लान बना दो';
  const result = await f.service.askContextAwareWellnessCoach({ uid: 'synthetic-member', question, dashboard, conversationId: 'fixture' });
  assert.equal(result.reply, 'synthetic model reply');
  assert.equal(f.outgoing[0].question, question);
  assert.equal(f.outgoing[0].coachContext, 'c'.repeat(3499));
  assert.equal(Object.hasOwn(f.outgoing[0], 'expectedUid'), false);
  assert.ok(f.prompts[0][1].content.includes(question));
  assert.ok(f.prompts[0][1].content.includes(f.outgoing[0].coachContext));
});

test('candidate accepts representative old APK payloads but rejects oversized or malformed fields before model call', async () => {
  const f = setup();
  const legacy = await f.post({ question: 'legacy context '.repeat(175) + 'आज का प्लान बना दो', dashboard });
  assert.equal(legacy.status, 200);
  assert.equal((await f.post({ question: 'x'.repeat(8001), dashboard })).status, 400);
  assert.equal((await f.post({ question: 'x'.repeat(2001), coachContext: '', dashboard })).status, 400);
  assert.equal((await f.post({ question: 'small', coachContext: 'x'.repeat(3501), dashboard })).status, 400);
  assert.equal((await f.post({ question: 'small', coachContext: { object: true }, dashboard })).status, 400);
  assert.equal((await f.post({ question: 'small', dashboard }, {})).status, 401);
  assert.equal(f.prompts.length, 1);
});

test('context does not go to the endpoint if account changes while the token is loading', async () => {
  const f = setup();
  f.auth.currentUser.getIdToken = async () => {
    f.auth.currentUser = { uid: 'different-member' };
    return 'fixture-token';
  };
  await assert.rejects(f.service.askContextAwareWellnessCoach({ uid: 'synthetic-member', question: 'hello', dashboard, conversationId: 'fixture' }), /sign-in changed/);
  assert.equal(f.outgoing.length, 0);
});

test('AI quota rejects sixth request before provider invocation', async () => {
  const f = setup();
  for (let i=0;i<5;i++) assert.equal((await f.post({question:'hello',dashboard})).status,200);
  assert.equal((await f.post({question:'hello',dashboard})).status,429);
  assert.equal(f.prompts.length,5);
});
