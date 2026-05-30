import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-800">
            Zenith CIS
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Content Intelligence System
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-neutral-500">A carregar…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
