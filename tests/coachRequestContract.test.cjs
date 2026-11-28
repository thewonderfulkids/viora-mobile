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

function setup({ providerError, appCheckRequired = false, allowedApps = "", appTokenProvider = async () => null } = {}) {
  const outgoing = [], prompts = [], providerRequests = [], errorLogs = [];
  const quotas = new Map();
  const user = { uid: 'synthetic-member', getIdToken: async () => 'fixture-token' };
  const auth = { currentUser: user };
  const admin = Object.fromEntries([
    './admin/bootstrapFirstAdmin','./admin/createDefaultAdmin','./admin/premiumAccessGrants',
    './accountDeletion/requestAccountDeletion','./accountDeletion/previewAccountDeletion',
    './accountDeletion/deletionPreflight','./accountDeletion/discoverDeletionDataPaths',
    './publishProfileAvatar','./scheduledAvatarCleanup',
  ].map(name => [name, {}]));
  const promptBuilder = load('functions/src/ai/promptBuilder.ts', {});
  const handler = load('functions/src/ai/wellness.ts', {
    './promptBuilder': promptBuilder,
    'firebase-functions/https': { HttpsError: Error },
    './client': { getOpenAIClient: () => ({
      responses: { create: async (input) => {
        providerRequests.push(input);
        prompts.push(input.input);
        if (providerError) throw providerError;
        return { output_text: 'synthetic model reply' };
      } },
    }) },
  }, { process: { env: { OPENAI_MODEL: 'synthetic-model' } } });
  const endpoint = load('functions/src/index.ts', {
    ...admin,
    './ai': handler,
    'firebase-admin/app': { initializeApp() {} },
    'firebase-admin/app-check': { getAppCheck: () => ({ verifyToken: async token => { if (token !== 'valid-app-token') throw Error('invalid'); return {appId:'fixture-app'}; } }) },
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
  }, { process: {env: {VIORA_ENFORCE_APP_CHECK: appCheckRequired ? "true" : "false", VIORA_APP_CHECK_ALLOWED_APP_IDS: allowedApps}}, console: { error: (...args) => errorLogs.push(args) } }).generateWellnessAdviceHttp;
  async function post(body, headers = { authorization: 'Bearer fixture-token' }, rawBody) {
    let status, result;
    await endpoint({ method: 'POST', headers, body, rawBody, get: name => headers[name.toLowerCase()] }, {
      status(code) { status = code; return this; },
      json(value) { result = value; },
    });
    return { status, result };
  }
  const cloud = load('src/services/ai/VioraCloudAIProvider.ts', {
    '../../firebase/firebaseConfig': { auth },
    '../../firebase/appCheckToken': { getVioraAppCheckToken: appTokenProvider },
    './aiErrors': load('src/services/ai/aiErrors.ts', {}, { Error }),
  }, {
    setTimeout, clearTimeout, AbortController,
    async fetch(_url, init) {
      const body = JSON.parse(init.body);
      outgoing.push(body);
      const { status, result } = await post(body, { authorization: init.headers.Authorization, 'x-firebase-appcheck': init.headers['X-Firebase-AppCheck'] });
      return { ok: status === 200, status, json: async () => result };
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
  return { auth, post, service, outgoing, prompts, providerRequests, errorLogs };
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

test('structured profile identifiers stay out of new client requests and old client provider prompts', async () => {
  const f = setup();
  const privateDashboard = {
    ...dashboard,
    user: {
      uid: 'private-profile-id', fullName: 'Private Fixture Name',
      email: 'private-profile@example.test', photoURL: 'https://example.test/private-photo',
      goal: 'Healthy Lifestyle', stressLevel: 'Low', lifestyle: 'Active',
    },
    todayStats: { ...dashboard.todayStats, uid: 'private-stats-id', dateKey: 'private-day-key' },
    greeting: 'Hello Private Fixture Name',
    tasks: [{ title: 'private-task' }],
  };
  const question = 'आज का प्लान बना दो';
  const result = await f.service.askContextAwareWellnessCoach({
    uid: 'synthetic-member', question, dashboard: privateDashboard, conversationId: 'fixture',
  });
  assert.equal(result.reply, 'synthetic model reply');
  assert.deepEqual(f.outgoing[0].dashboard, {
    ...dashboard, user: { goal: 'Healthy Lifestyle', stressLevel: 'Low', lifestyle: 'Active' },
  });

  // Already installed APKs can still send their old dashboard shape.
  assert.equal((await f.post({ question, dashboard: privateDashboard })).status, 200);
  assert.equal(f.providerRequests.length, 2);
  for (const request of f.providerRequests) {
    assert.equal(request.store, false);
    assert.equal(Object.hasOwn(request, 'previous_response_id'), false);
    assert.match(request.input[1].content, /Sleep: 400 minutes/);
    assert.match(request.input[1].content, /Goal: Healthy Lifestyle/);
    assert.ok(request.input[1].content.includes(question));
    assert.doesNotMatch(JSON.stringify(request), /Private Fixture Name|private-profile|private-stats|private-day|private-task|private-photo/);
  }
});


test('malformed wellness statistics and profile fields are rejected before quota or provider use', async () => {
  const f = setup();
  const invalid = [
    { ...dashboard, todayStats: [] },
    { ...dashboard, todayStats: {} },
    { ...dashboard, todayStats: { ...dashboard.todayStats, waterMl: -1 } },
    { ...dashboard, todayStats: { ...dashboard.todayStats, sleepMinutes: '400' } },
    { ...dashboard, todayStats: { ...dashboard.todayStats, yogaMinutes: Infinity } },
    { ...dashboard, wellnessScore: 101 },
    { ...dashboard, user: { goal: { injected: true } } },
    { ...dashboard, user: { lifestyle: 'x'.repeat(257) } },
  ];
  for (const value of invalid) {
    assert.equal((await f.post({ question: 'hello', dashboard: value })).status, 400);
  }
  assert.equal(f.providerRequests.length, 0);
  for (let i = 0; i < 5; i++) assert.equal((await f.post({ question: 'hello', dashboard })).status, 200);
  assert.equal(f.providerRequests.length, 5);
});

test('provider failure sends a generic 503 and logs only a fixed message', async () => {
  const question = 'synthetic-private-request';
  const providerError = Object.assign(new Error('synthetic-provider-diagnostic'), {
    request: { question },
  });
  const f = setup({ providerError });
  const { status, result } = await f.post({ question, dashboard });

  assert.equal(f.providerRequests.length, 1);
  assert.ok(f.prompts[0][1].content.includes(question));
  assert.equal(status, 503);
  assert.deepEqual(Object.keys(result), ['error']);
  assert.equal(result.error, 'AI Coach is temporarily unavailable. Please try again later.');
  assert.deepEqual(f.errorLogs, [['Wellness AI provider request failed']]);
});

test('H07 rejects non-object bodies and oversized raw payloads before quota', async () => {
  const f=setup();
  for(const body of [null, [], "hello", 42]) assert.equal((await f.post(body)).status,400);
  assert.equal((await f.post({question:'hello',dashboard},undefined,Buffer.alloc(262145))).status,413);
  assert.equal(f.providerRequests.length,0);
});
test('H08 verifies supplied tokens and fails closed when enforcement is enabled',async()=>{
  const body={question:'hello',dashboard};
  const headers=token=>({authorization:'Bearer fixture-token','x-firebase-appcheck':token});
  const f=setup({appCheckRequired:true,allowedApps:'fixture-app'});
  assert.equal((await f.post(body)).status,401);
  assert.equal((await f.post(body,headers('invalid'))).status,401);
  assert.equal((await f.post(body,headers('valid-app-token'))).status,200);
  const other=setup({appCheckRequired:true,allowedApps:'other-app'});
  assert.equal((await other.post(body,headers('valid-app-token'))).status,401);
  const legacy=setup();
  assert.equal((await legacy.post(body,headers('invalid'))).status,401);
  assert.equal((await legacy.post(body)).status,200);
});

test('H08 client forwards attestation token and rechecks session before sending',async()=>{
  const f=setup({appCheckRequired:true,appTokenProvider:async()=> 'valid-app-token'});
  assert.equal((await f.service.askContextAwareWellnessCoach({uid:'synthetic-member',question:'hello',dashboard,conversationId:'fixture'})).reply,'synthetic model reply');
  const g=setup({appTokenProvider:async()=>{g.auth.currentUser={uid:'other'};return 'valid-app-token';}});
  await assert.rejects(g.service.askContextAwareWellnessCoach({uid:'synthetic-member',question:'hello',dashboard,conversationId:'fixture'}),/sign-in changed/);
  assert.equal(g.outgoing.length,0);
});

test('H07 accepts exact limits and rejects overflow without provider use', async () => {
  const f = setup();
  assert.equal((await f.post({question:'x'.repeat(2000),coachContext:'c'.repeat(3500),dashboard},undefined,Buffer.alloc(262144))).status,200);
  for (const body of [
    {question:' ',dashboard},
    {question:'hello',dashboard:{...dashboard,todayStats:{...dashboard.todayStats,musicMinutes:1441}}},
    {question:'hello',dashboard:{...dashboard,todayStats:{...dashboard.todayStats,waterMl:100001}}},
    {question:'hello',dashboard:{...dashboard,user:[]}},
  ]) assert.equal((await f.post(body)).status,400);
  assert.equal(f.providerRequests.length,1);
});
test('H10 provider credentials and health payload never appear in HTTP errors or captured error logs', async () => {
  const secret = 'synthetic-secret-credential';
  const health = 'synthetic-private-health-record';
  const f = setup({providerError:Object.assign(new Error(secret),{headers:{authorization:secret},body:{health}})});
  const response = await f.post({question:health,dashboard});
  assert.equal(response.status,503);
  assert.doesNotMatch(JSON.stringify([response,f.errorLogs]),/synthetic-secret-credential|synthetic-private-health-record/);
  assert.deepEqual(f.errorLogs,[['Wellness AI provider request failed']]);
});

test('H09 provider client disables implicit retries and bounds request timeout', () => {
  let options;
  const client = load('functions/src/ai/client.ts', {
    openai: {__esModule: true, default: class {constructor(value){options=value;}}},
    '../config/env': {getRequiredEnv: () => 'synthetic-key'},
  });
  client.getOpenAIClient();
  assert.equal(options.maxRetries,0);
  assert.equal(options.timeout,20000);
});
