const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/app/yoga.tsx'), 'utf8');
const screen = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;

const sessionUrl = 'https://example.test/session.mp4';
const poseUrl = 'https://example.test/pose.mp4';

function mount(fullUrl, poseUrls) {
  const session = {
    id: 'session', title: 'Full session', videoUrl: fullUrl,
    steps: poseUrls.map((videoUrl, index) => ({ title: 'Pose ' + (index + 1), durationSeconds: 1, videoUrl })),
  };
  const states = [];
  const effects = [];
  let index = 0;
  let tick;
  const jsx = (type, props, key) => ({ type, props, key });
  const app = { exports: {} };
  const aliases = new Proxy({}, { get: (_, name) => name });
  vm.runInNewContext(screen, {
    exports: app.exports,
    setInterval(callback) { tick = callback; return callback; },
    clearInterval() {},
    require(id) {
      if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (id === 'react') return {
        useMemo: fn => fn(),
        useEffect: fn => effects.push(fn),
        useState(initial) {
          const slot = index++;
          if (!(slot in states)) states[slot] = initial;
          return [states[slot], next => { states[slot] = typeof next === 'function' ? next(states[slot]) : next; }];
        },
      };
      if (id === 'react-native') return { ScrollView: 'ScrollView', Text: 'Text', StyleSheet: { create: x => x } };
      if (id === '../hooks') return { useDashboard: () => ({}), useYoga: () => ({ catalog: [session] }) };
      if (id === '../theme') return { colors: aliases, spacing: aliases };
      return aliases;
    },
  });
  function render() {
    effects.length = 0;
    index = 0;
    const tree = app.exports.default();
    effects.forEach(fn => fn());
    return tree;
  }
  function all(node, name) {
    if (Array.isArray(node)) return node.flatMap(child => all(child, name));
    if (!node || typeof node !== 'object') return [];
    return [...(node.type === name ? [node] : []), ...all(node.props?.children, name)];
  }
  const get = name => all(render(), name);
  const start = () => {
    get('YogaSessionCard')[0].props.onStart(session.id);
    get('YogaSessionPreviewCard')[0].props.onStart();
  };
  const advance = () => { render(); tick(); render(); };
  start();
  return { get, advance, start, videos: () => get('WorkoutVideoPlayer') };
}

test('full-session-only Yoga mounts one player and retains it across unmapped poses', () => {
  const app = mount(sessionUrl, [undefined, '  ']);
  const first = app.videos();
  assert.equal(first.length, 1);
  assert.equal(first[0].props.title, 'Full session');
  assert.equal(first[0].props.url, sessionUrl);
  app.advance();
  assert.equal(app.videos()[0].key, first[0].key);
});

test('mapped pose takes precedence; an unmapped pose falls back to one session player', () => {
  const app = mount(sessionUrl, [poseUrl, undefined]);
  assert.deepEqual(app.videos().map(x => [x.props.title, x.props.url]), [['Pose 1', poseUrl]]);
  app.advance();
  assert.deepEqual(app.videos().map(x => [x.props.title, x.props.url]), [['Full session', sessionUrl]]);
});

test('pose-only playback disappears at an unmapped pose and the timer remains visible', () => {
  const app = mount(undefined, [poseUrl, undefined]);
  assert.equal(app.videos()[0].props.url, poseUrl);
  app.advance();
  assert.equal(app.videos().length, 0);
  assert.equal(app.get('YogaTimerCard')[0].props.currentStep, 2);
});

test('closing hides playback across pose transitions without ending the timer', () => {
  const app = mount(sessionUrl, [poseUrl, undefined]);
  app.videos()[0].props.onClose();
  assert.equal(app.videos().length, 0);
  assert.equal(app.get('YogaTimerCard')[0].props.running, true);
  app.advance();
  assert.equal(app.videos().length, 0);
  assert.equal(app.get('YogaTimerCard')[0].props.currentStep, 2);
});

test('media-free Yoga remains timer-only; an empty catalog entry does not start', () => {
  assert.equal(mount(undefined, [undefined]).get('YogaTimerCard').length, 1);
  assert.equal(mount(undefined, []).get('YogaTimerCard').length, 0);
});
