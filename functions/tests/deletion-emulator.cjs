const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { createEmulatorDeletionAdapter, recoverStoppedFixtureLease } = require('../lib/accountDeletion/emulatorDeletionAdapter');
const { executeDeletion } = require('../lib/accountDeletion/deletionExecutionCore');
test('C01 synthetic deletion, protected records, retry and idempotency', async () => {
  for (const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','FIREBASE_STORAGE_EMULATOR_HOST']) assert.match(process.env[key] || '', /^(localhost|127\.0\.0\.1):\d+$/);
  assert.equal(process.env.GCLOUD_PROJECT,'demo-viora-deletion');
  const app = initializeApp({projectId:'demo-viora-deletion',storageBucket:'demo-viora-deletion.appspot.com'});
  const auth = getAuth(app), db = getFirestore(app), bucket = getStorage(app).bucket();
  const uid = 'fixture-' + Date.now(), other = uid + '-other';
  const account = await auth.createUser({uid,disabled:true});
  await auth.createUser({uid:other});
  const lock = db.doc('deletionFixtures/'+uid);
  await lock.set({frozen:true,creationTime:account.metadata.creationTime});
  const owned = lock.collection('records').doc('owned'), retained = lock.collection('records').doc('retained');
  await owned.set({ownerIds:[uid]});
  await retained.set({ownerIds:[uid,other],shared:true});
  const file = bucket.file('deletion-fixtures/'+uid+'/avatar.jpg'), foreign = bucket.file('deletion-fixtures/'+other+'/avatar.jpg');
  await file.save(Buffer.from('fixture')); await foreign.save(Buffer.from('other'));
  const adapter = createEmulatorDeletionAdapter(uid);
  const contender = createEmulatorDeletionAdapter(uid);
  await adapter.withExclusiveLease(uid, async () => {
    await assert.rejects(contender.withExclusiveLease(uid, async () => {
      assert.fail('Concurrent worker acquired lock');
    }), /Fixture unavailable/);
    assert.equal((await lock.get()).get('leased'),true);
    assert.equal(typeof (await lock.get()).get('leaseToken'),'string');
  });
  assert.equal((await lock.get()).get('leased'),false);
  assert.equal((await lock.get()).get('leaseToken'),null);
  // Simulate a crashed worker leaving a durable lease behind.
  const abandonedToken = 'abandoned-fixture-worker';
  await lock.update({leased:true,leaseToken:abandonedToken,leaseAcquiredAt:new Date(0)});
  await assert.rejects(executeDeletion(uid,createEmulatorDeletionAdapter(uid)),/Fixture unavailable/);
  assert.equal((await lock.get()).get('leaseToken'),abandonedToken);
  assert.equal((await owned.get()).exists,true);
  assert.equal((await file.exists())[0],true);
  assert.equal((await auth.getUser(uid)).disabled,true);
  // Test harness alone confirms no worker was launched for this synthetic lease.
  // This is not an automatic timeout or a production recovery endpoint.
  await assert.rejects(recoverStoppedFixtureLease(uid,abandonedToken,''),/Recovery evidence required/);
  await assert.rejects(recoverStoppedFixtureLease(uid,'wrong-token','synthetic worker never launched'),/Recovery lease mismatch/);
  assert.equal((await lock.get()).get('leaseToken'),abandonedToken);
  assert.equal((await lock.collection('recoveryAudit').get()).size,0);
  const evidence = 'synthetic worker never launched';
  await recoverStoppedFixtureLease(uid,abandonedToken,evidence);
  assert.equal((await lock.get()).get('leased'),false);
  assert.equal((await lock.get()).get('frozen'),true);
  await assert.rejects(recoverStoppedFixtureLease(uid,abandonedToken,evidence),/Recovery lease mismatch/);
  const audit = await lock.collection('recoveryAudit').get();
  assert.equal(audit.size,1);
  assert.equal(audit.docs[0].get('previousToken'),abandonedToken);
  assert.equal(audit.docs[0].get('evidence'),evidence);
  assert.ok(audit.docs[0].get('recoveredAt'));
  const failing = {...adapter, eraseOwnedStorage: async () => {throw Error('injected interruption');}};
  await assert.rejects(executeDeletion(uid,failing),/injected interruption/);
  assert.equal((await lock.get()).get('state'),'retry_required');
  assert.equal((await auth.getUser(uid)).uid,uid);
  assert.equal((await executeDeletion(uid,adapter)).complete,true);
  assert.equal((await owned.get()).exists,false);
  assert.equal((await retained.get()).exists,true);
  assert.equal((await file.exists())[0],false);
  assert.equal((await foreign.exists())[0],true);
  assert.equal((await auth.getUser(other)).uid,other);
  await assert.rejects(auth.getUser(uid),{code:'auth/user-not-found'});
  assert.equal((await executeDeletion(uid,adapter)).complete,true);
  // Exercise the real callable handler with synthetic verified Auth identity.
  const { claimPendingPremiumGrant } = require('../lib/admin/premiumAccessGrants');
  const email = other + '@example.test';
  await auth.updateUser(other,{email,emailVerified:true});
  const key = require('node:crypto').createHash('sha256').update(email).digest('hex');
  const pending = db.doc('pendingPremiumGrants/'+key);
  const subscription = db.doc('subscriptions/admin_grant_'+other);
  const grant = {email,status:'pending',planCode:'PLUS_MONTHLY',createdAt:new Date().toISOString()};
  await pending.set(grant);
  const freeze = db.doc('accountDeletionLocks/'+other);
  await freeze.set({frozen:true});
  const claim = () => claimPendingPremiumGrant.run({auth:{uid:other,token:{}},data:{}});
  await assert.rejects(claim(),/Account deletion is in progress/);
  assert.equal((await pending.get()).exists,true);
  assert.equal((await subscription.get()).exists,false);
  await freeze.delete();
  const results = await Promise.all([claim(),claim()]);
  assert.equal(results.filter(x=>x.claimed===true).length,1);
  assert.equal((await pending.get()).exists,false);
  assert.equal((await subscription.get()).get('planCode'),'PLUS_MONTHLY');
  assert.equal((await claim()).claimed,false);
  const { adminGrantPremiumByEmail } = require('../lib/admin/premiumAccessGrants');
  const adminUid = uid + '-admin';
  await auth.createUser({uid:adminUid,email:adminUid+'@example.test'});
  await auth.setCustomUserClaims(adminUid,{admin:true});
  const adminFreeze = db.doc('accountDeletionLocks/'+adminUid);
  await adminFreeze.set({frozen:true});
  const grantByAdmin = targetEmail => adminGrantPremiumByEmail.run({
    auth:{uid:adminUid,token:{}},data:{email:targetEmail,planCode:'PRO_YEARLY'}
  });
  await assert.rejects(grantByAdmin(email),/deletion is in progress/);
  assert.equal((await subscription.get()).get('planCode'),'PLUS_MONTHLY');
  const newEmail = uid+'-new@example.test';
  const newKey = require('node:crypto').createHash('sha256').update(newEmail).digest('hex');
  await assert.rejects(grantByAdmin(newEmail),/deletion is in progress/);
  assert.equal((await db.doc('pendingPremiumGrants/'+newKey).get()).exists,false);
  await adminFreeze.delete();
  await freeze.set({frozen:true});
  await assert.rejects(grantByAdmin(email),/deletion is in progress/);
  assert.equal((await subscription.get()).get('planCode'),'PLUS_MONTHLY');
  await freeze.delete();
  assert.equal((await grantByAdmin(email)).status,'active');
  assert.equal((await subscription.get()).get('planCode'),'PRO_YEARLY');
  // Interpose a replacement after the callable reads its pending snapshot,
  // but before the real Firestore transaction starts.
  await pending.set(grant);
  const originalTransaction = db.runTransaction;
  let replaced = false;
  db.runTransaction = async function (...args) {
    if (!replaced) {
      replaced = true;
      await pending.set({...grant,planCode:'PLUS_YEARLY'});
    }
    return originalTransaction.apply(this,args);
  };
  try {
    assert.equal((await claim()).claimed,false);
    assert.equal(replaced,true);
    assert.equal((await pending.get()).get('planCode'),'PLUS_YEARLY');
    assert.equal((await subscription.get()).get('planCode'),'PRO_YEARLY');
  } finally {
    db.runTransaction = originalTransaction;
  }
  assert.equal((await claim()).claimed,true);
  assert.equal((await subscription.get()).get('planCode'),'PLUS_YEARLY');
  assert.equal((await pending.get()).exists,false);
  // Exercise production request/preflight handlers against synthetic accounts only.
  const { requestAccountDeletion } = require('../lib/accountDeletion/requestAccountDeletion');
  const { prepareAccountDeletion, resetAccountDeletionPreflight } = require('../lib/accountDeletion/deletionPreflight');
  await auth.setCustomUserClaims(adminUid,{superAdmin:true});
  const deletionRequest = db.doc('accountDeletionRequests/'+other);
  const requestDeletion = authTime => requestAccountDeletion.run({auth:{uid:other,token:{auth_time:authTime}},data:{}});
  const prepare = () => prepareAccountDeletion.run({auth:{uid:adminUid,token:{}},data:{userId:other,confirmation:'PREPARE:'+other}});
  const now = Math.floor(Date.now()/1000);
  await assert.rejects(requestDeletion(now+600),/Recent sign-in required/);
  await assert.rejects(requestDeletion(now-600),/Recent sign-in required/);
  assert.equal((await deletionRequest.get()).exists,false);
  await deletionRequest.set({userId:other,status:'requested'});
  await assert.rejects(prepare(),/identity mismatch or legacy request/);
  assert.equal((await deletionRequest.get()).get('status'),'requested');
  await deletionRequest.update({authCreationTime:'Thu, 01 Jan 1970 00:00:00 GMT'});
  await assert.rejects(prepare(),/identity mismatch or legacy request/);
  await deletionRequest.delete();
  assert.equal((await requestDeletion(now)).status,'requested');
  assert.equal((await deletionRequest.get()).get('authCreationTime'),(await auth.getUser(other)).metadata.creationTime);
  assert.equal((await requestDeletion(now)).alreadyRequested,true);
  await freeze.set({frozen:true});
  await assert.rejects(prepare(),/lock already exists/);
  await freeze.delete();
  assert.equal((await prepare()).deletionPerformed,false);
  assert.equal((await prepare()).alreadyPrepared,true);
  assert.equal((await freeze.get()).exists,false);
  assert.equal((await auth.getUser(other)).uid,other);
  const resetPrepared = () => resetAccountDeletionPreflight.run({auth:{uid:adminUid,token:{}},data:{userId:other}});
  const originalCreationTime = (await auth.getUser(other)).metadata.creationTime;
  await deletionRequest.update({authCreationTime:'Thu, 01 Jan 1970 00:00:00 GMT'});
  await assert.rejects(resetPrepared(),/identity mismatch or legacy request/);
  assert.equal((await deletionRequest.get()).get('status'),'preflight');
  await deletionRequest.update({authCreationTime:originalCreationTime});
  assert.equal((await resetAccountDeletionPreflight.run({auth:{uid:adminUid,token:{}},data:{userId:other}})).status,'requested');
  assert.equal((await deletionRequest.get()).get('status'),'requested');

  const { assertLockCandidate, assertProductionLockActivationDisabled } = require('../lib/accountDeletion/productionLockPolicy');
  const identity = (await auth.getUser(other)).metadata.creationTime;
  const candidate = {uid:other,authCreationTime:identity,request:{userId:other,authCreationTime:identity,status:'preflight'},existingLock:false,actorLocked:false};
  assert.doesNotThrow(()=>assertLockCandidate(candidate));
  for (const invalid of [
    {...candidate,existingLock:true},
    {...candidate,actorLocked:true},
    {...candidate,authCreationTime:'invalid'},
    {...candidate,uid:'bad/path'},
    {...candidate,request:{...candidate.request,status:'requested'}},
    {...candidate,request:{...candidate.request,userId:adminUid}},
    {...candidate,request:{...candidate.request,authCreationTime:undefined}},
    {...candidate,request:{...candidate.request,authCreationTime:'Thu, 01 Jan 1970 00:00:00 GMT'}}
  ]) assert.throws(()=>assertLockCandidate(invalid));
  assert.throws(()=>assertProductionLockActivationDisabled(),/activation disabled/);
  assert.equal((await freeze.get()).exists,false);

  const { freezeFixtureAccount } = require('../lib/accountDeletion/emulatorLockTransaction');
  await assert.rejects(freezeFixtureAccount(other,adminUid),/Matching prepared/);
  await prepare();
  await adminFreeze.set({frozen:true});
  await assert.rejects(freezeFixtureAccount(other,adminUid),/Existing deletion lock/);
  assert.equal((await freeze.get()).exists,false);
  await adminFreeze.delete();
  const freezeResults = await Promise.allSettled([
    freezeFixtureAccount(other,adminUid),freezeFixtureAccount(other,adminUid)
  ]);
  assert.equal(freezeResults.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(freezeResults.filter(x=>x.status==='rejected').length,1);
  assert.equal((await freeze.get()).get('frozen'),true);
  assert.equal((await freeze.get()).get('authCreationTime'),identity);
  assert.equal((await deletionRequest.get()).get('cleanupStatus'),'frozen_fixture');
  // No pending grant is a harmless no-op; seed a real pending grant to test mutation denial.
  assert.equal((await claim()).claimed,false);
  await pending.set(grant);
  await assert.rejects(claim(),/Account deletion is in progress/);
  assert.equal((await pending.get()).exists,true);
  assert.equal((await subscription.get()).get('planCode'),'PLUS_YEARLY');
  await assert.rejects(prepare(),/lock already exists/);
  assert.equal((await auth.getUser(other)).uid,other);

  const { discoverDeletionDataPaths } = require('../lib/accountDeletion/discoverDeletionDataPaths');
  const discover = () => discoverDeletionDataPaths.run({auth:{uid:adminUid,token:{}},data:{userId:other}});
  const orphanParent = db.doc('fixtureInventory/'+other);
  await orphanParent.collection('messages').doc('sample').set({userId:other});
  await orphanParent.collection('messages').doc('missing-parent').collection('attachments').doc('sample').set({userId:other});
  assert.equal((await orphanParent.get()).exists,false);
  const discovery = await discover();
  assert.equal(discovery.complete,false);
  assert.ok(discovery.nestedCollectionPaths.includes(orphanParent.path+'/messages'));
  assert.ok(discovery.nestedCollectionPaths.includes(orphanParent.path+'/messages/missing-parent/attachments'));
  assert.ok(discovery.inspectedNestedDocuments >= 2);
  assert.equal(discovery.deletionPerformed,false);
  await adminFreeze.set({frozen:true});
  await assert.rejects(discover(),/Acting account deletion is in progress/);
  await adminFreeze.delete();
  await deletionRequest.update({authCreationTime:'Thu, 01 Jan 1970 00:00:00 GMT'});
  await assert.rejects(discover(),/identity mismatch or legacy request/);
  await deletionRequest.update({authCreationTime:identity});

  const { previewAccountDeletion } = require('../lib/accountDeletion/previewAccountDeletion');
  const preview = () => previewAccountDeletion.run({auth:{uid:adminUid,token:{}},data:{userId:other}});
  await adminFreeze.set({frozen:true});
  await assert.rejects(preview(),/Acting account deletion is in progress/);
  await adminFreeze.delete();
  await deletionRequest.update({authCreationTime:'Thu, 01 Jan 1970 00:00:00 GMT'});
  await assert.rejects(preview(),/identity mismatch or legacy request/);
  await deletionRequest.update({authCreationTime:identity});
  await auth.updateUser(adminUid,{disabled:true});
  try {
    await assert.rejects(preview(),/Administrator privileges required/);
    await assert.rejects(discover(),/Super Admin required/);
  } finally {
    await auth.updateUser(adminUid,{disabled:false});
  }

  const { classifyRetention } = require('../lib/accountDeletion/retentionPolicy');
  for (const name of ['payments','subscriptions','premiumProgramEntitlements']) {
    assert.equal(classifyRetention(name),'manual_retention_review');
  }
  for (const name of ['familyGroups','familyMembers','familyInvites']) {
    assert.equal(classifyRetention(name),'shared_ownership_review');
  }
  for (const name of ['accountDeletionLocks','accountDeletionRequests','aiGlobalBudget']) {
    assert.equal(classifyRetention(name),'preserve_control_record');
  }
  for (const name of ['users','unknownCollection','','payments/nested']) {
    assert.equal(classifyRetention(name),'unclassified');
  }
  const inventoryPreview = await preview();
  assert.equal(inventoryPreview.incomplete,true);
  assert.ok(inventoryPreview.retentionReview.length > 0);
  assert.ok(inventoryPreview.retentionReview.every(row => row.automaticErasureAuthorized === false));
  assert.equal(inventoryPreview.retentionReview.find(row => row.collection === 'payments').decision,'manual_retention_review');
  assert.equal(inventoryPreview.retentionReview.find(row => row.collection === 'familyGroups').decision,'shared_ownership_review');
  assert.equal(inventoryPreview.retentionReview.find(row => row.collection === 'accountDeletionLocks').decision,'preserve_control_record');
  assert.equal((await freeze.get()).exists,true);
  assert.equal((await subscription.get()).exists,true);

  const { planDeletion } = require('../lib/accountDeletion/deletionExecutionCore');
  for (const path of ['payments/p1','subscriptions/s1','familyGroups/g1/members/m1','users/u1/familyInvites/i1','accountDeletionLocks/l1','accountDeletionRequests/r1','aiGlobalBudget/b1']) {
    const record = {path,ownerIds:[other],shared:false,retained:false};
    assert.throws(()=>planDeletion(other,{complete:true,unresolved:[],candidates:[record]}),/Retention policy review required/);
    assert.deepEqual(planDeletion(other,{complete:true,unresolved:[],candidates:[{...record,retained:true}]}),[]);
  }

  const { summarizeAvatarTokenMetadata } = require('../lib/accountDeletion/avatarTokenInventory');
  assert.deepEqual(summarizeAvatarTokenMetadata({metadata:{firebaseStorageDownloadTokens:'fixture-secret'}}),{tokenPresent:true,metadataReviewRequired:false});
  assert.deepEqual(summarizeAvatarTokenMetadata({metadata:{firebaseStorageDownloadTokens:42}}),{tokenPresent:false,metadataReviewRequired:true});
  assert.deepEqual(summarizeAvatarTokenMetadata({}),{tokenPresent:false,metadataReviewRequired:false});
  const tokenFixture = bucket.file('profile-photos/'+other+'/avatar-123.jpg');
  await tokenFixture.save(Buffer.from('fixture'),{metadata:{contentType:'image/jpeg',metadata:{firebaseStorageDownloadTokens:'fixture-secret-token'}}});
  const tokenPreview = await preview();
  assert.ok(tokenPreview.avatarTokenInventory.inspected >= 1);
  assert.ok(tokenPreview.avatarTokenInventory.tokenPresentCount >= 1);
  assert.equal(JSON.stringify(tokenPreview).includes('fixture-secret-token'),false);
  assert.equal((await tokenFixture.exists())[0],true);

});

test('H09 real Firestore emulator admits only one of concurrent Coach callers at final budget slot', async () => {
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(localhost|127\\.0\\.0\\.1):\\d+$/);
  assert.equal(process.env.GCLOUD_PROJECT, 'demo-viora-deletion');
  const { getApps } = require('firebase-admin/app');
  const app = getApps()[0];
  assert.ok(app);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const budget = db.doc('aiGlobalBudget/daily');
  const previous = await budget.get();
  const oldLimit = process.env.VIORA_AI_GLOBAL_DAILY_LIMIT;
  const originalVerify = auth.verifyIdToken;
  const ai = require('../lib/ai');
  const originalHandler = ai.generateWellnessAdviceHandler;
  let calls = 0;
  const ids = Array.from({length: 6}, (_,i) => 'h09-fixture-'+Date.now()+'-'+i);
  try {
    process.env.VIORA_AI_GLOBAL_DAILY_LIMIT = '1000';
    await budget.set({day:Math.floor(Date.now()/86400000),count:999});
    auth.verifyIdToken = async token => { assert.ok(ids.includes(token)); return {uid:token}; };
    // Replace only the model boundary; no external provider requests.
    ai.generateWellnessAdviceHandler = async () => { calls++; return {answer:'fixture'}; };
    const endpoint = require('../lib/index').generateWellnessAdviceHttp;
    assert.equal(typeof endpoint,'function');
    const results = await Promise.all(ids.map(uid => new Promise((resolve,reject) => {
      let status;
      const req = {method:'POST',headers:{authorization:'Bearer '+uid},get:()=>undefined,body:{question:'fixture',dashboard:{todayStats:{waterMl:0,sleepMinutes:0,yogaMinutes:0,musicMinutes:0},wellnessScore:0}}};
      const res = {status(n){status=n;return this;},json(){resolve(status);},send(){resolve(status);},setHeader(){},getHeader(){},on(){return this;},once(){return this;}};
      Promise.resolve(endpoint(req,res)).catch(reject);
    })));
    assert.equal(results.filter(x=>x===200).length,1);
    assert.equal(results.filter(x=>x===429).length,5);
    assert.equal(calls,1);
    assert.equal((await budget.get()).get('count'),1000);
    const records = await Promise.all(ids.map(uid=>db.doc('aiRateLimits/'+uid).get()));
    assert.equal(records.filter(x=>x.exists).length,1);
  } finally {
    auth.verifyIdToken = originalVerify;
    ai.generateWellnessAdviceHandler = originalHandler;
    if(oldLimit===undefined) delete process.env.VIORA_AI_GLOBAL_DAILY_LIMIT; else process.env.VIORA_AI_GLOBAL_DAILY_LIMIT=oldLimit;
    await Promise.all(ids.map(uid=>db.doc('aiRateLimits/'+uid).delete()));
    if(previous.exists) await budget.set(previous.data()); else await budget.delete();
  }
});
