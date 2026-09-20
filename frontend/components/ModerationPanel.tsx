"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function ModerationPanel({
  observationId,
  initialIsVerified,
}: {
  observationId: string;
  initialIsVerified: boolean;
}) {
  const router = useRouter();
  const [isModerator, setIsModerator] = useState(false);
  const [isHidden, setIsHidden] = useState(false); // si cargó la página, no estaba oculta
  const [isVerified, setIsVerified] = useState(initialIsVerified);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id;
      if (!userId) return;

      supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()
        .then(({ data }) => setIsModerator(data?.role === "moderator"));
    });
  }, []);

  async function updateModeration(patch: { is_hidden?: boolean; is_verified?: boolean }) {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/observations/${observationId}/moderation`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      }
    );

    setLoading(false);
    if (!res.ok) return;

    if (patch.is_hidden === true) {
      setIsHidden(true);
      return;
    }

    setIsHidden(false);
    if (patch.is_verified !== undefined){
        setIsVerified(patch.is_verified)
    }
    router.refresh();
  }

  if (!isModerator) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-paper-alt p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Moderación{isHidden && " · oculta actualmente"}
      </span>
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => updateModeration({ is_verified: !isVerified })}
          className="flex-1 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-semibold text-ink disabled:opacity-50"
        >
          {isVerified ? "Quitar verificación" : "Verificar identificación"}
        </button>
        <button
          disabled={loading}
          onClick={() => updateModeration({ is_hidden: !isHidden })}
          className="flex-1 rounded-lg border border-alert/30 bg-white px-3 py-2 text-xs font-semibold text-alert disabled:opacity-50"
        >
          {isHidden ? "Mostrar de nuevo" : "Ocultar publicación"}
        </button>
      </div>
    </div>
  );
}