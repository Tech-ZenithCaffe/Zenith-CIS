"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "@/types/database";
import type { AuthState } from "@/types/auth";
import { profileToAuthUser } from "@/types/auth";

type SupabaseContextValue = {
  supabase: ReturnType<typeof createClient>;
  auth: AuthState;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a Providers");
  }
  return context.supabase;
}

export function useAuth() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useAuth must be used within a Providers");
  }
  return context.auth;
}

export function Providers({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [auth, setAuth] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let mounted = true;

    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setAuth({ user: null, loading: false });
      }
    }

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single<Profile>();
      if (!mounted) return;
      if (data) {
        setAuth({ user: profileToAuthUser(data), loading: false });
      } else {
        setAuth({ user: null, loading: false });
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setAuth({ user: null, loading: false });
      }
    });

    fetchSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, auth }}>
      {children}
    </SupabaseContext.Provider>
  );
}
