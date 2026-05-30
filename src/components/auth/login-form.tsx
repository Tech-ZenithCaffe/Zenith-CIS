"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import type { LoginInput } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const input: LoginInput = { email, password };

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword(input);

        if (authError) {
          setError(mapAuthError(authError).message);
          return;
        }

        router.push(redirect);
        router.refresh();
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          setError(mapAuthError(authError).message);
          return;
        }

        setMode("login");
        setSuccessMessage("Conta criada! Verifica o teu email para confirmar.");
      }
    } catch (err) {
      setError(mapAuthError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ola@zenith.pt"
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={loading}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Palavra-passe</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={loading}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            A processar…
          </span>
        ) : mode === "login" ? "Entrar" : "Criar conta"}
      </button>
      <p className="text-center text-sm text-neutral-500">
        {mode === "login" ? (
          <>
            Não tens conta?{" "}
            <button type="button" onClick={() => { setMode("signup"); setError(null); setSuccessMessage(null); }}
              className="font-medium text-brand-600 hover:text-brand-700">Criar conta</button>
          </>
        ) : (
          <>
            Já tens conta?{" "}
            <button type="button" onClick={() => { setMode("login"); setError(null); setSuccessMessage(null); }}
              className="font-medium text-brand-600 hover:text-brand-700">Entrar</button>
          </>
        )}
      </p>
    </form>
  );
}
