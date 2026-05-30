"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/auth";

interface AuthButtonProps {
  user: AuthUser;
}

export function AuthButton({ user }: AuthButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline">{user.name}</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
            <div className="border-b px-4 py-2">
              <p className="text-xs text-neutral-500">{user.email}</p>
              <p className="text-xs font-medium text-brand-600">
                {user.role === "admin" ? "Administrador" : user.market === "portugal" ? "Criador • Portugal" : "Criador • Espanha"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {loading ? "A sair…" : "Sair"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
