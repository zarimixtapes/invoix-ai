"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt, ArrowLeft } from "lucide-react";
import { Button, Field, Input } from "@/components/ui/primitives";
import { useStore } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");
  const setSubscription = useStore((s) => s.setSubscription);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (plan === "starter" || plan === "pro") {
      setSubscription({ plan, state: "trialing" });
    }
    setTimeout(() => router.push("/dashboard"), 350);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-100 px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
          <Receipt size={17} />
        </span>
        Invoix AI
      </Link>

      <div className="w-full max-w-sm rounded-xl2 border border-ink-200/60 bg-white p-7 shadow-card">
        <div className="mb-5 flex rounded-lg bg-paper-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-1.5 transition-colors ${
              mode === "signup" ? "bg-white text-ink-900 shadow-card" : "text-ink-500"
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-1.5 transition-colors ${
              mode === "login" ? "bg-white text-ink-900 shadow-card" : "text-ink-500"
            }`}
          >
            Log in
          </button>
        </div>

        <h1 className="font-display text-xl font-semibold text-ink-900">
          {mode === "signup" ? "Create your demo workspace" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          This is a demo login — no password is checked. Your data is saved locally in this browser.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Business name" required={mode === "signup"}>
            <Input placeholder="e.g. Harbour & Co. Trade Services" required={mode === "signup"} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <Input type="password" placeholder="••••••••" required minLength={4} />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up your workspace…" : mode === "signup" ? "Create workspace" : "Log in"}
          </Button>
        </form>

        {plan && (
          <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-700">
            You'll start a 14-day trial of the <span className="font-medium capitalize">{plan}</span> plan.
          </p>
        )}
      </div>

      <Link href="/" className="mt-6 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft size={14} />
        Back to homepage
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
