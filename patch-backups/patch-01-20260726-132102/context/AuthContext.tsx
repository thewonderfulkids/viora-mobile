import { User, getIdTokenResult, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

import { auth, db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { UserAccessRole, UserDoc } from "../firebase/firestoreTypes";
import { isVioraAccessAdmin } from "../services/adminAccess";

type AuthContextType = {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isAuthenticated: boolean;
  accessRole: UserAccessRole;
  isAdmin: boolean;
  refreshUserDoc: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  loading: true,
  isAuthenticated: false,
  accessRole: "user",
  isAdmin: false,
  refreshUserDoc: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenRole, setTokenRole] = useState<UserAccessRole>("user");

  async function loadUserDoc(currentUser: User | null) {
    if (!currentUser) {
      setUserDoc(null);
      setTokenRole("user");
      return;
    }

    const tokenResult = await getIdTokenResult(currentUser, true);
    const claimedRole = tokenResult.claims.role;
    setTokenRole(
      claimedRole === "admin" || claimedRole === "super_admin"
        ? claimedRole
        : "user"
    );

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

  const accessRole: UserAccessRole =
    tokenRole !== "user"
      ? tokenRole
      : userDoc?.accessRole === "admin" || userDoc?.accessRole === "super_admin"
        ? userDoc.accessRole
        : isVioraAccessAdmin(user?.email)
          ? "admin"
          : "user";

  const isAdmin = accessRole === "admin" || accessRole === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        isAuthenticated: !!user,
        accessRole,
        isAdmin,
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