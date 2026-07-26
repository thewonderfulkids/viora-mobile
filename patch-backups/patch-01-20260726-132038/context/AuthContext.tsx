import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

import { auth, db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { UserDoc } from "../firebase/firestoreTypes";

type AuthContextType = {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserDoc: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  loading: true,
  isAuthenticated: false,
  refreshUserDoc: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserDoc(currentUser: User | null) {
    if (!currentUser) {
      setUserDoc(null);
      return;
    }

    const userRef = doc(db, COLLECTIONS.users, currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setUserDoc(userSnap.data() as UserDoc);
    } else {
      setUserDoc(null);
    }
  }

  async function refreshUserDoc() {
    await loadUserDoc(auth.currentUser);
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setUserDoc(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setLoading(true);
        setUser(currentUser);
        await loadUserDoc(currentUser);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        isAuthenticated: !!user,
        refreshUserDoc,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}