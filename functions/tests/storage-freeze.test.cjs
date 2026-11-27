const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } = require('firebase/auth');
const { getStorage, connectStorageEmulator, ref, uploadBytes, getMetadata } = require('firebase/storage');
const { initializeApp: initializeAdmin, deleteApp: deleteAdmin } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = 'demo-viora-deletion';
test('C02 client profile uploads stop after the account freeze', async t => {
  assert.equal(process.env.GCLOUD_PROJECT, projectId);
  for (const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','FIREBASE_STORAGE_EMULATOR_HOST']) {
    assert.match(process.env[key] || '', /^127\.0\.0\.1:\d+$/);
  }
  const bucket = projectId + '.appspot.com';
  const admin = initializeAdmin({ projectId }, 'storage-freeze-admin');
  t.after(() => deleteAdmin(admin));
  const db = getFirestore(admin);
  const suffix = Date.now();
  async function member(label) {
    const app = initializeApp({ projectId, apiKey: 'demo-key', storageBucket: bucket }, label);
    t.after(() => deleteApp(app));
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST, { disableWarnings: true });
    const { user } = await createUserWithEmailAndPassword(auth, label + '-' + suffix + '@example.test', 'fixture-password-123');
    const storage = getStorage(app);
    const port = Number(process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':')[1]);
    connectStorageEmulator(storage, '127.0.0.1', port);
    return { uid: user.uid, storage };
  }
  const owner = await member('owner');
  const control = await member('control');
  const upload = (member, name) => uploadBytes(
    ref(member.storage, 'profile-photos/' + member.uid + '/' + name),
    Uint8Array.from([137, 80, 78, 71]), { contentType: 'image/png' },
  );
  await upload(owner, 'before.png');
  const ownerPath = 'profile-photos/' + owner.uid + '/before.png';
  assert.equal((await getMetadata(ref(owner.storage, ownerPath))).contentType, 'image/png');
  await assert.rejects(getMetadata(ref(control.storage, ownerPath)), { code: 'storage/unauthorized' });
  const guest = initializeApp({ projectId, apiKey: 'demo-key', storageBucket: bucket }, 'storage-guest');
  t.after(() => deleteApp(guest));
  const guestStorage = getStorage(guest);
  connectStorageEmulator(guestStorage, '127.0.0.1', Number(process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':')[1]));
  await assert.rejects(getMetadata(ref(guestStorage, ownerPath)), { code: 'storage/unauthorized' });
  await db.doc('accountDeletionLocks/' + owner.uid).set({ frozen: true });
  await assert.rejects(upload(owner, 'after.png'), { code: 'storage/unauthorized' });
  await assert.rejects(upload(owner, 'before.png'), { code: 'storage/unauthorized' });
  await upload(control, 'after.png');
});
