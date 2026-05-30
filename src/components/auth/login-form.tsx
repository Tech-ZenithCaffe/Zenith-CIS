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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const supabase = createClient();

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(mapAuthError(authError).message);
        return;
      }

      // Redireciona para a URL de consentimento do Google
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("Erro ao iniciar autenticação com Google. Tenta novamente.");
      }
    } catch (err) {
      setError(mapAuthError(err).message);
    } finally {
      setGoogleLoading(false);
    }
  }

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
    <div className="space-y-4">
      {/* Botão Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {googleLoading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        {googleLoading ? "A redirecionar para o Google…" : "Entrar com Google"}
      </button>

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-50 px-2 text-neutral-400">ou</span>
        </div>
      </div>

      {/* Formulário email/password */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
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
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Palavra-passe
          </label>
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
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tens conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
