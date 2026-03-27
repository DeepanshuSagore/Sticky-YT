"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth } from "@/lib/firebase-client";

export function LandingAuthActions() {
  const router = useRouter();
  const { user, loading, syncSessionToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    setError("");
    setSubmitting(true);

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
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in with Google.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm">
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-full border border-red-500/45 bg-black/50 text-sm font-semibold text-red-100 opacity-75"
        >
          Loading...
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-full max-w-sm">
        <Link
          href="/me"
          className="red-glow flex h-12 w-full items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-red-400"
        >
          Open ME
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={submitting}
        className="red-glow flex h-12 w-full items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-75"
      >
        {submitting ? "Please wait..." : "Continue with Google"}
      </button>
      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
