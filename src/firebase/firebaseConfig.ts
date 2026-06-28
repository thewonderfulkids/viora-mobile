import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBh46PgwgXiJHNxjo0hYtgRTJL6nIwnRKY",
  authDomain: "viora-9021a.firebaseapp.com",
  projectId: "viora-9021a",
  storageBucket: "viora-9021a.firebasestorage.app",
  messagingSenderId: "828098472036",
  appId: "1:828098472036:web:aa577e3dcc2bfa3f961771",
  measurementId: "G-5L4QXF8BDP",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;