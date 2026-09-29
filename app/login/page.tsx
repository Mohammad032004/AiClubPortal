"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    setError("Invalid email or password.");
    setLoading(false);
    return;
  }

  const response = await fetch("/api/auth/session");
  const session = await response.json();

  if (session?.user?.role) {
  router.push("/portal");
} else {
  setError("Your account does not have a valid role.");
  setLoading(false);
}
};

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Section */}
        <section className="relative hidden overflow-hidden bg-slate-50 lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold tracking-wide text-slate-900">
                  AI CLUB
                </p>
                <p className="text-xs text-slate-500">
                  Learning & Project Portal
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
                AI Club Portal
              </p>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 xl:text-6xl">
                Learn.
                <br />
                Build.
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Create the Future.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">
                A dedicated platform for AI Club members to learn new
                technologies, complete practical tasks, collaborate with their
                teams, and build real-world projects.
              </p>
            </div>

            <p className="text-xs text-slate-400">
              © 2026 AI Club. Internal Portal.
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">AI CLUB</p>
                <p className="text-xs text-slate-500">
                  Learning & Project Portal
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your AI Club portal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-violet-600 transition hover:text-violet-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" />
              Secure AI Club portal
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}