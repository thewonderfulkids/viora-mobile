const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const source = fs.readFileSync(path.join(__dirname, "../src/context/AuthContext.tsx"), "utf8");
const program = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const flush = () => new Promise(resolve => setImmediate(resolve));
const a = { uid: "a", email: "a@example.invalid" }, b = { uid: "b", email: "b@example.invalid" };
const claims = role => ({ claims: { role } });
const profile = (uid, extra = {}) => ({ exists: () => true, data: () => ({ uid, ...extra }) });
const noProfile = { exists: () => false };

function fixture() {
  const auth = { currentUser: null };
  let subscribed, unsubscribe, state, ref, signOutResolve, writes = 0;
  const tokens = [], profiles = [];
  function queue(list, uid) {
    return new Promise((resolve, reject) => list.push({ uid, resolve, reject }));
  }
  const modules = {
    "firebase/auth": {
      getIdTokenResult: user => queue(tokens, user.uid),
      onAuthStateChanged(_auth, listener) { subscribed = listener; return () => { subscribed = null; }; },
      signOut: () => new Promise(resolve => { signOutResolve = resolve; }),
    },
    "firebase/firestore": { doc: (_db, _name, uid) => uid, getDoc: uid => queue(profiles, uid) },
    react: {
      createContext: () => ({ Provider: Symbol("Auth.Provider") }),
      useContext: () => assert.fail("not required"),
      useState(initial) {
        state ??= initial;
        return [state, update => { writes++; state = typeof update === "function" ? update(state) : update; }];
      },
      useRef(initial) { return ref ??= { current: initial }; },
      useEffect(effect) { unsubscribe ??= effect(); },
    },
    "react/jsx-runtime": { jsx: (_type, props) => props.value },
    "../firebase/firebaseConfig": { auth, db: {} },
    "../firebase/firestoreCollections": { COLLECTIONS: { users: "users" } },
    "../services/adminAccess": { isVioraAccessAdmin: () => false },
  };
  const exports = {};
  vm.runInNewContext(program, { exports, require: id => {
    assert.ok(Object.hasOwn(modules, id), id);
    return modules[id];
  } });
  const render = () => exports.AuthProvider({});
  render();
  return { render, auth, tokens, profiles, writes: () => writes, unmount: unsubscribe,
    switchTo(user) { auth.currentUser = user; subscribed(user); },
    finishLogout() { signOutResolve(); },
  };
}

test("late claims cannot publish the prior account role or start a stale profile read", async () => {
  const f = fixture();
  f.switchTo(a);
  f.switchTo(b);
  f.tokens[1].resolve(claims("user"));
  await flush();
  f.profiles[0].resolve(noProfile);
  await flush();
  f.tokens[0].resolve(claims("super_admin"));
  await flush();
  assert.deepEqual(f.profiles.map(p => p.uid), ["b"]);
  assert.equal(f.render().user, b);
  assert.equal(f.render().userDoc, null);
  assert.equal(f.render().accessRole, "user");
  assert.equal(f.render().loading, false);
});

test("an old profile cannot finish a new session or control onboarding", async () => {
  const f = fixture();
  f.switchTo(a);
  f.tokens[0].resolve(claims("super_admin"));
  await flush();
  f.switchTo(b);
  f.profiles[0].resolve(profile("a", { onboardingCompleted: true }));
  await flush();
  assert.equal(f.render().user, b);
  assert.equal(f.render().userDoc, null);
  assert.equal(f.render().isAdmin, false);
  assert.equal(f.render().loading, true);
  f.tokens[1].resolve(claims("user"));
  await flush();
  f.profiles[1].resolve(profile("b", { onboardingCompleted: false }));
  await flush();
  assert.equal(f.render().userDoc.uid, "b");
  assert.equal(f.render().userDoc.onboardingCompleted, false);
  assert.equal(f.render().loading, false);
});

test("only the newest refresh can commit, including after an A-to-B-to-A session switch", async () => {
  const f = fixture();
  f.switchTo(a);
  const old = f.render().refreshUserDoc();
  f.tokens[1].resolve(claims("super_admin"));
  await flush();
  f.switchTo(b);
  f.switchTo(a);
  const previous = f.render().refreshUserDoc();
  f.tokens[4].resolve(claims("admin"));
  await flush();
  const latest = f.render().refreshUserDoc();
  f.tokens[5].resolve(claims("user"));
  await flush();
  f.profiles[2].resolve(profile("a", { source: "latest" }));
  await latest;
  f.profiles[1].reject(Error("obsolete failure"));
  f.profiles[0].resolve(profile("a", { source: "old session" }));
  await Promise.all([old, previous]);
  assert.equal(f.render().userDoc.source, "latest");
  assert.equal(f.render().accessRole, "user");
});

test("observer lag, sign-out, and late logout resolution do not expose or clear another account", async () => {
  const f = fixture();
  f.switchTo(a);
  f.tokens[0].resolve(claims("admin"));
  await flush();
  f.profiles[0].resolve(profile("a"));
  await flush();
  const logout = f.render().logout();
  f.auth.currentUser = null;
  assert.equal(f.render().user, null);
  assert.equal(f.render().isAdmin, false);
  f.switchTo(null);
  assert.equal(f.render().loading, false);
  f.switchTo(b);
  f.tokens[1].resolve(claims("user"));
  await flush();
  f.profiles[1].resolve(profile("b"));
  await flush();
  f.finishLogout();
  await logout;
  assert.equal(f.render().user, b);
  assert.equal(f.render().userDoc.uid, "b");
});

test("failed initial lookup settles safely; unmounted provider ignores pending updates", async () => {
  const f = fixture();
  f.switchTo(a);
  f.tokens[0].resolve(claims("super_admin"));
  await flush();
  f.profiles[0].reject(Error("profile unavailable"));
  await flush();
  assert.equal(f.render().loading, false);
  assert.equal(f.render().userDoc, null);
  assert.equal(f.render().isAdmin, false);
  const pending = f.render().refreshUserDoc();
  f.unmount();
  const count = f.writes();
  f.tokens[1].resolve(claims("admin"));
  await pending;
  assert.equal(f.writes(), count);
});

function authServiceFixture({switchBefore=false,switchAfter=false}={}) {
 const auth={currentUser:a}, writes=[];
 const credential={user:a};
 const authenticate=async()=>{auth.currentUser=switchBefore?b:a;return credential;};
 const modules={
  "firebase/auth":{createUserWithEmailAndPassword:authenticate,signInWithEmailAndPassword:authenticate,signOut:async()=>{}},
  "firebase/firestore":{doc:(_db,_collection,uid)=>uid,serverTimestamp:()=>0,setDoc:async(uid,data)=>{writes.push({uid,data});if(switchAfter)auth.currentUser=b;}},
  "../firebase/firebaseConfig":{auth,db:{}},
  "../firebase/firestoreCollections":{COLLECTIONS:{users:"users"}}
 };
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,"../src/services/authService.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:id=>{assert.ok(Object.hasOwn(modules,id),id);return modules[id];}});
 return {writes,login:()=>exports.login("a@example.invalid","fixture"),register:()=>exports.register({fullName:"Alice",email:"a@example.invalid",password:"fixture",mobile:"1234567890",gender:"female",age:30})};
}
test("HA04 registration rejects stale credentials before writing a profile",async()=>{
 const f=authServiceFixture({switchBefore:true});
 await assert.rejects(f.register(),/Account changed/);
 assert.equal(f.writes.length,0);
});
test("HA04 registration rejects stale credentials after profile write",async()=>{
 const f=authServiceFixture({switchAfter:true});
 await assert.rejects(f.register(),/Account changed/);
 assert.equal(f.writes.length,1);
 assert.equal(f.writes[0].uid,"a");
});
test("HA04 login rejects switched sessions and stable sessions remain functional",async()=>{
 await assert.rejects(authServiceFixture({switchBefore:true}).login(),/Account changed/);
 const f=authServiceFixture();
 assert.equal((await f.login()).user.uid,"a");
 assert.equal((await f.register()).user.uid,"a");
 assert.equal(f.writes.length,1);
});
