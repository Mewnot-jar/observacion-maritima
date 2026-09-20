"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

const supabase = createClient();

export function AuthStatus() {
  const { session, loading, openLoginModal } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      Promise.resolve().then(() => setDisplayName(null));
      return;
    }

    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setDisplayName(data?.display_name ?? null));
  }, [session]);

  if (loading) return null;

  if (!session) {
    return (
      <button onClick={openLoginModal} className="text-sm font-semibold text-accent">
        Iniciar sesión
      </button>
    );
  }

  const label = displayName ?? session.user.email ?? "";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 max-w-[140px] truncate text-sm text-ink-muted" title={label}>
        {label}
      </span>
      <button onClick={() => supabase.auth.signOut()} className="flex-shrink-0 text-sm font-semibold text-accent">
        Salir
      </button>
    </div>
  );
}