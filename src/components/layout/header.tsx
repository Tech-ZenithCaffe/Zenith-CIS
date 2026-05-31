import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth/auth-button";
import type { AuthUser } from "@/types/auth";
import type { Profile } from "@/types/database";

export async function Header() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName = "";
  let userRole: AuthUser["role"] = "creator_portugal";
  let userMarket: AuthUser["market"] = "portugal";
  let userEmail = "";

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<Profile>();

    if (data) {
      userName = data.name;
      userRole = data.role;
      userMarket = data.market;
      userEmail = data.email;
    }
  }

  const authUser = user
    ? {
        id: user.id,
        name: userName,
        email: userEmail,
        role: userRole,
        market: userMarket,
        avatarUrl: null as string | null,
      }
    : null;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="font-display text-xl font-bold text-brand-700">
          Zenith CIS
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/ideas" className="transition-colors hover:text-brand-600">Ideias</Link>
          <Link href="/calendar" className="transition-colors hover:text-brand-600">Calendário</Link>
          <Link href="/settings" className="transition-colors hover:text-brand-600">Definições</Link>
{authUser ? (
             <AuthButton user={{ id: authUser.id, email: authUser.email, name: authUser.name, role: authUser.role, market: authUser.market, avatarUrl: authUser.avatarUrl }} />
           ) : (
            <Link href="/auth/login" className="rounded-lg bg-brand-600 px-4 py-2 text-white transition-colors hover:bg-brand-700">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
