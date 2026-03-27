"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  syncSessionToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSessionToken = useCallback(async () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth?.currentUser) {
      await fetch("/api/auth/session", { method: "DELETE" });
      return null;
    }

    const token = await firebaseAuth.currentUser.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return token;
  }, []);

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      try {
        await syncSessionToken();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncSessionToken]);

  const value = useMemo(
    () => ({
      user,
      loading,
      syncSessionToken,
    }),
    [loading, syncSessionToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
