"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        setError(null);
        setLoading(true);

        const { error } =
            mode === "login"
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });
            
        setLoading(false);

        if (error){
            setError(error.message);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return(
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 bg-paper px-6">
            <h1 className="font-serif-display text-3xl font-semibold text-ink">
                {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                type="email"
                required
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
                />
                <input
                type="password"
                required
                minLength={6}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
                />

                {error && <p className="text-sm text-alert">{error}</p>}

                <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
                >
                {loading ? "Cargando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
            </form>

            <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-ink-muted"
            >
                {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
        </div>
    )
}