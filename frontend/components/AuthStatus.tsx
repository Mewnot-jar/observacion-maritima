"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function AuthStatus() {
    const [session, setSession] = useState<Session | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

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
            <Link href="/login" className="text-sm font-semibold text-accent">
                Iniciar sesión
            </Link>
        );
    }

    const label = displayName ?? session.user.email ?? "";

    return (
        <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 max-w-[140px] truncate text-sm text-ink-muted" title={label}>
                {label}
            </span>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-ink-muted">
                Salir
            </button>
        </div>
    );
}