const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(relative, deps) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: id => { assert.ok(Object.hasOwn(deps, id), id); return deps[id]; } });
  return exports;
}

const account = uid => ({ uid, email: uid + "@example.invalid" });
const deferred = () => {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
};

function fixture({ upload, update, picker } = {}) {
  const a = account("a"), b = account("b"), auth = { currentUser: a };
  const writes = [], tokenReads = [];
  const repository = load("src/repositories/profilePhotoRepository.ts", {
    "../firebase/firebaseConfig": { storage: {} },
    "firebase/storage": {
      ref: (_storage, key) => key,
      uploadString: upload ?? (async () => {}),
      getDownloadURL: async key => { tokenReads.push(key); return "https://example.invalid/new-avatar"; },
    },
  });
  const { pickAndUploadProfilePhoto } = load("src/services/user/profilePhotoService.ts", {
    "../../firebase/firebaseConfig": { auth },
    "expo-image-picker": {
      requestMediaLibraryPermissionsAsync: async () => ({ granted: true }),
      launchImageLibraryAsync: picker ?? (async () => ({ canceled: false, assets: [{ uri: "fixture:/image.jpg" }] })),
      MediaTypeOptions: { Images: "images" },
    },
    "expo-image-manipulator": { manipulateAsync: async () => ({ base64: "/9j/2Q==" }), SaveFormat: { JPEG: "jpeg" } },
    "../../repositories": {
      uploadProfilePhoto: repository.uploadProfilePhoto,
      updateUserPhoto: async (uid, value) => { writes.push({ uid, value }); await update?.(); },
    },
  });
  return { auth, a, b, writes, tokenReads, pickAndUploadProfilePhoto };
}

test("the active account persists the uploaded avatar and the existing fallback remains available", async () => {
  const regular = fixture();
  assert.equal(await regular.pickAndUploadProfilePhoto("a"), "https://example.invalid/new-avatar");
  assert.equal(regular.writes.length, 1);
  assert.equal(regular.writes[0].uid, "a");
  const fallback = fixture({ upload: async () => { throw Error("ArrayBuffer unavailable"); } });
  assert.match(await fallback.pickAndUploadProfilePhoto("a"), /^data:image\/jpeg;base64,/);
  assert.equal(fallback.writes.length, 1);
});

test("a Storage permission failure is not treated as a native upload defect", async () => {
  const f = fixture({ upload: async () => { throw Object.assign(Error("Storage denied"), { code: "storage/unauthorized" }); } });
  await assert.rejects(f.pickAndUploadProfilePhoto("a"), /Storage denied/);
  assert.equal(f.writes.length, 0);
});

test("failed Firestore profile save does not retry with a fallback or report an uploaded preview", async () => {
  const f = fixture({ update: async () => { throw Error("Storage-formatted error from profile write"); } });
  await assert.rejects(f.pickAndUploadProfilePhoto("a"), /profile write/);
  assert.deepEqual(f.writes.map(x => x.value), ["https://example.invalid/new-avatar"]);
});

test("a pending picker result after a different login does not write or request a token", async () => {
  const gate = deferred();
  const f = fixture({ picker: () => gate.promise });
  const pending = f.pickAndUploadProfilePhoto("a", f.a);
  f.auth.currentUser = f.b;
  gate.resolve({ canceled: false, assets: [{ uri: "fixture:/image.jpg" }] });
  await assert.rejects(pending, /Sign in again/);
  assert.equal(f.writes.length, 0);
  assert.equal(f.tokenReads.length, 0);
});

test("a native upload finishing after a same-UID relogin cannot request a URL or publish a profile write", async () => {
  const gate = deferred(), started = deferred();
  const f = fixture({ upload: async () => { started.resolve(); await gate.promise; } });
  const pending = f.pickAndUploadProfilePhoto("a", f.a);
  await started.promise;
  f.auth.currentUser = account("a");
  gate.resolve();
  await assert.rejects(pending, /Sign in again/);
  assert.equal(f.writes.length, 0);
  assert.equal(f.tokenReads.length, 0);
});

test("Profile discards a late avatar and toast after switching account", async () => {
  const a = account("a"), b = account("b"), auth = { currentUser: a }, gate = deferred();
  const state = [], refs = [], effects = [], alerts = [];
  let si = 0, ri = 0, ei = 0, refreshes = 0;
  const stub = new Proxy({}, { get: (_obj, key) => key });
  const JSX = (type, props, key) => ({ type, props, key });
  const { default: Screen } = load("src/app/(tabs)/profile.tsx", {
    "react/jsx-runtime": { jsx: JSX, jsxs: JSX },
    "expo-router": { router: { replace() {} } }, "firebase/auth": { signOut: async () => {} },
    "lucide-react-native": stub,
    react: {
      useEffect(fn) { const i = ei++; if (!(i in effects)) effects[i] = fn(); },
      useState(initial) { const i = si++; if (!(i in state)) state[i] = initial; return [state[i], v => { state[i] = v; }]; },
      useRef(initial) { const i = ri++; return refs[i] ??= { current: initial }; },
    },
    "react-native": { ...stub, ScrollView: "ScrollView", View: "View", Text: "Text", Pressable: "Pressable",
      StyleSheet: { create: x => x }, Alert: { alert: (...args) => alerts.push(args) } },
    "../../components/common": stub, "../../components/profile": stub,
    "../../context/AuthContext": { useAuth: () => ({
      user: a, userDoc: { photoURL: "fixture:/old-avatar" }, authSessionId: 1,
      refreshUserDoc: async () => { refreshes++; },
    }) },
    "../../firebase/firebaseConfig": { auth },
    "../../hooks/useDashboard": { useDashboard: () => ({ data: null, refresh: async () => { refreshes++; } }) },
    "../../services/user/profilePhotoService": { pickAndUploadProfilePhoto: () => gate.promise },
    "../../services/user/userService": {},
    "../../theme": { colors: {}, radius: {}, spacing: {} },
  });
  const render = () => { si = ri = ei = 0; return Screen().type(); };
  const find = (node, type) => {
    if (!node) return undefined;
    if (node.type === type) return node.props;
    const children = node.props?.children;
    return [].concat(children ?? []).map(child => find(child, type)).find(Boolean);
  };
  render();
  const hero = find(render(), "ProfileHero");
  assert.equal(hero.photoURL, "fixture:/old-avatar");
  const pending = hero.onPhotoPress();
  auth.currentUser = b;
  gate.resolve("fixture:/a-new-avatar");
  await pending;
  assert.equal(refreshes, 0);
  assert.deepEqual(alerts, []);
  assert.equal(find(render(), "ProfileHero").photoURL, "fixture:/old-avatar");
});
