"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { useAuth } from "@/components/auth-provider";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { user, loading: authLoading, syncSessionToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const subtitle = useMemo(
    () =>
      isLogin
        ? "Pick up right where you left off with Google."
        : "Create your focused watch tracker with Google.",
    [isLogin],
  );

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

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
      router.push("/dashboard");
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

  return (
    <div className="glass-card noise-bg relative w-full max-w-md rounded-3xl p-8">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {isLogin ? "Welcome Back" : "Start with StickyYT"}
      </h1>
      <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>

      <div className="mt-7 space-y-4">
        {error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={submitting}
          className="red-glow flex h-11 w-full items-center justify-center rounded-xl bg-red-500 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {submitting
            ? "Please wait..."
            : isLogin
              ? "Continue with Google"
              : "Create with Google"}
        </button>
      </div>
    </div>
  );
}
