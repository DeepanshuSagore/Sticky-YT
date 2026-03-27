"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth } from "@/lib/firebase-client";

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, syncSessionToken } = useAuth();
  const [working, setWorking] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const handleGoogleAuth = async () => {
    setWorking(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error("Firebase Auth is unavailable.");
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(firebaseAuth, provider);
      await syncSessionToken();
      router.push("/me");
    } finally {
      setWorking(false);
    }
  };

  const handleLogout = async () => {
    setWorking(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      }
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/");
    } finally {
      setWorking(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-red-500/20 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-red-300 uppercase">
          StickyYT
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isActive("/")
                ? "bg-red-500/20 text-red-200"
                : "text-zinc-300 hover:bg-red-950/30 hover:text-zinc-100"
            }`}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive("/dashboard")
                    ? "bg-red-500/20 text-red-200"
                    : "text-zinc-300 hover:bg-red-950/30 hover:text-zinc-100"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/me"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive("/me")
                    ? "bg-red-500/20 text-red-200"
                    : "text-zinc-300 hover:bg-red-950/30 hover:text-zinc-100"
                }`}
              >
                ME
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-zinc-400">Loading...</span>
          ) : user ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={working}
              className="rounded-lg border border-red-500/40 bg-red-500/12 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-70"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={working}
              className="rounded-lg border border-red-500/40 bg-red-500/12 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-70"
            >
              {working ? "Please wait..." : "Google Sign-In"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
