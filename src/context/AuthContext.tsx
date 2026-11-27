import { User, getIdTokenResult, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { auth, db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { UserAccessRole, UserDoc } from "../firebase/firestoreTypes";
import { isVioraAccessAdmin } from "../services/adminAccess";

type AuthContextType = {
  authSessionId: number;
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
  authSessionId: 0,
  user: null,
  userDoc: null,
  loading: true,
  isAuthenticated: false,
  accessRole: "user",
  isAdmin: false,
  refreshUserDoc: async () => {},
  logout: async () => {},
});

type Snapshot = {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  tokenRole: UserAccessRole;
  session: number;
};

const initial: Snapshot = { user: null, userDoc: null, loading: true, tokenRole: "user", session: 0 };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState(initial);
  const active = useRef({ mounted: false, user: null as User | null, session: 0, version: 0 });

  async function loadUserDoc(currentUser: User) {
    const { session } = active.current;
    const version = ++active.current.version;
    const isCurrent = () => active.current.mounted && active.current.session === session &&
      active.current.version === version && active.current.user === currentUser && auth.currentUser === currentUser;

    try {
      const tokenResult = await getIdTokenResult(currentUser, true);
      if (!isCurrent()) return;
      const claimedRole = tokenResult.claims.role;
      const userSnap = await getDoc(doc(db, COLLECTIONS.users, currentUser.uid));
      if (!isCurrent()) return;
      setSnapshot({
        user: currentUser,
        userDoc: userSnap.exists() ? userSnap.data() as UserDoc : null,
        tokenRole: claimedRole === "admin" || claimedRole === "super_admin" ? claimedRole : "user",
        loading: false,
        session,
      });
    } catch (error) {
      if (!isCurrent()) return;
      // Keep an already-loaded profile for this session only. Never finish
      // another session's initial load or publish claims from a partial read.
      setSnapshot((previous) => previous.session === session
        ? { ...previous, loading: false }
        : previous);
      throw error;
    }
  }

  async function refreshUserDoc() {
    const currentUser = active.current.user;
    if (active.current.mounted && currentUser && auth.currentUser === currentUser) {
      await loadUserDoc(currentUser);
    }
  }

  async function logout() {
    // The auth observer is the sole owner of session changes. A late signOut
    // resolution must not clear a subsequent login.
    await signOut(auth);
  }

  useEffect(() => {
    active.current.mounted = true;
    let subscribed = true;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!subscribed || auth.currentUser !== currentUser) return;
      const session = ++active.current.session;
      ++active.current.version;
      active.current.user = currentUser;
      setSnapshot({ ...initial, user: currentUser, loading: !!currentUser, session });
      if (currentUser) void loadUserDoc(currentUser).catch(() => {
        // Initial lookup failures settle this session in loadUserDoc.
      });
    });

    return () => {
      subscribed = false;
      active.current.mounted = false;
      ++active.current.version;
      unsubscribe();
    };
  }, []);

  // React can rerender between Firebase switching and observer delivery. Do
  // not expose the last snapshot during that gap, or across a same-UID relogin.
  const { user, userDoc, loading, tokenRole } =
    snapshot.session === active.current.session && snapshot.user === auth.currentUser ? snapshot : initial;

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
        authSessionId: snapshot.session,
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
