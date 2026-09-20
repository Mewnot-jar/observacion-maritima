"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function AuthStatus() {
    const [session, setSession] = useState<Session | null>(null);
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

    if (loading) return null;

    if (!session) {
        return (
            <Link href="/login" className="text-sm font-semibold text-accent">
                Iniciar sesión
            </Link>
        );
    }

    return (
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-ink-muted">
            Salir
        </button>
    );
}