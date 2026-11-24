const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/services/voice/coachVoiceInput.ts'), 'utf8');
const moduleFixture = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: moduleFixture.exports });
const { submitCoachVoiceInput } = moduleFixture.exports;

test('asks Coach with the exact plan, nutrition, and steps transcript, never navigates', async () => {
  for (const prompt of [
    'आज का प्लान बना दो', "plan today's day", 'मेरे कितने स्टेप्स हुए?',
    'How many steps did I walk today?', 'make a nutrition plan', 'Breakfast plan bana do',
    'show me a nutrition plan', 'open steps and tell me my total', 'show my weekly report',
    'open steps?', 'do not open membership',
  ]) {
    const calls = [];
    await submitCoachVoiceInput(prompt, {
      ask: async (value) => calls.push(['ask', value]),
      navigate: (route) => calls.push(['navigate', route]),
    });
    assert.deepEqual(calls, [['ask', prompt]]);
  }
});

test('only an exact explicit navigation phrase opens a known screen', async () => {
  for (const [prompt, expected] of [[' Open Steps. ', '/steps'], ['न्यूट्रिशन खोल दो।', '/nutrition'], ['please go to membership please', '/premium']]) {
    const calls = [];
    await submitCoachVoiceInput(prompt, {
      ask: async (value) => calls.push(['ask', value]),
      navigate: (route) => calls.push(['navigate', route]),
    });
    assert.deepEqual(calls, [['navigate', expected]]);
  }
});

test('a Coach failure does not fall back to navigation or change retry input', async () => {
  const prompt = "plan today's day";
  let retryPrompt;
  const fail = new Error('backend unavailable');
  await assert.rejects(submitCoachVoiceInput(prompt, {
    ask: async (value) => { retryPrompt = value; throw fail; },
    navigate: () => assert.fail('navigated after Coach failure'),
  }), error => error === fail);
  assert.equal(retryPrompt, prompt);
});

test('Coach mic entry sends transcript to the chat and retry uses the same text', async () => {
  const transcript = 'आज का प्लान बना दो';
  const states = [], calls = [], routes = [], errors = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props });
  const hooks = {
    useCallback: fn => fn,
    useMemo: fn => fn(),
    useEffect() {},
    useRef: current => ({ current }),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
  };
  const aliases = new Proxy({}, { get: (_, key) => key });
  const mockCoach = {
    messages: [], retryAvailable: false, threads: [], quickActions: [], followUps: [],
    askWellnessCoach: async (text, options) => { calls.push(options?.retry ? transcript : text); if (!options?.retry) mockCoach.messages.push({ id: String(calls.length), role: 'user', message: text }); mockCoach.retryAvailable = true; throw Error('unavailable'); },
  };
  const appSource = fs.readFileSync(path.join(__dirname, '../src/app/ai-coach.tsx'), 'utf8');
  const app = { exports: {} };
  vm.runInNewContext(ts.transpileModule(appSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports: app.exports, require(id) {
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (id === 'react') return hooks;
    if (id === 'expo-router') return { useLocalSearchParams: () => ({}), router: { push: r => routes.push(r) } };
    if (id === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', KeyboardAvoidingView: 'KeyboardAvoidingView', useWindowDimensions: () => ({ width: 400 }), Platform: { OS: 'android' }, StyleSheet: { create: x => x, absoluteFillObject: {} } };
    if (id === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({ bottom: 0 }) };
    if (id === '../hooks') return { useAICoach: () => mockCoach, useToast: () => ({ error: e => errors.push(e) }), useVoiceAI: () => ({ startTranscribing: async () => transcript }) };
    if (id === '../theme') return { colors: aliases, spacing: aliases, radius: aliases };
    if (id === '../i18n') return { T: { ai: { title: 'AI Coach' } } };
    if (id === '../i18n/useAppTranslation') return { useAppTranslation: () => ({ t: x => x }) };
    if (id.endsWith('/coachVoiceInput')) return { submitCoachVoiceInput };
    return aliases;
  } });
  function find(tree, predicate) {
    if (Array.isArray(tree)) return tree.map(child => find(child, predicate)).find(Boolean);
    if (!tree || typeof tree !== 'object') return;
    return predicate(tree) ? tree : find(tree.props?.children, predicate);
  }
  const render = () => { cursor = 0; return app.exports.default(); };
  await find(render(), x => x.props?.onPress?.name === 'handleStartListening' || (x.props?.accessibilityRole === 'button' && x.props?.children?.type === 'Mic')).props.onPress();
  assert.deepEqual(calls, [transcript]);
  assert.deepEqual(routes, []);
  assert.equal(errors[0]?.message, 'unavailable');
  assert.ok(find(render(), x => x.type === 'AIMessageBubble' && x.props.message === transcript));
  const retry = find(render(), x => x.props?.children?.props?.children === 'Retry last question');
  assert.ok(retry);
  await retry.props.onPress();
  assert.deepEqual(calls, [transcript, transcript]);
});
