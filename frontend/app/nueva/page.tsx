"use client";

import { useState, type SubmitEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SpeciesAutocomplete } from "@/components/SpeciesAutocomplete";

const LocationPicker = dynamic(
    () => import("@/components/LocationPicker").then((mod) => mod.LocationPicker),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-48 items-center justify-center bg-paper-alt text-sm text-ink-faint">
                Cargando mapa…
            </div>
        ),
    }
);

const CATEGORIES = [
  { value: "ave", label: "Ave" },
  { value: "mamifero_marino", label: "Mamífero marino" },
  { value: "pez", label: "Pez" },
  { value: "invertebrado", label: "Invertebrado" },
  { value: "alga_flora", label: "Alga / flora" },
  { value: "otro", label: "Otro" },
];
const INDIVIDUAL_COUNTS = ["1", "2-5", "6-20", "+20"];
const CONFIDENCE_LEVELS = [
  { value: "segura", label: "Segura" },
  { value: "bastante_segura", label: "Bastante segura" },
  { value: "no_segura", label: "No estoy seguro" },
];

type Species = { id: string; common_name: string; scientific_name: string | null; category: string };

export default function NuevaObservacionPage() {
    const router = useRouter();
    const supabase = createClient();

    const [category, setCategory] = useState<string | null>(null);
    const [species, setSpecies] = useState<Species | null>(null);
    const [observedAt, setObservedAt] = useState("");
    const [position, setPosition] = useState({ lat: -20.22, lng: -70.152 });
    const [locationName, setLocationName] = useState("");
    const [individualCount, setIndividualCount] = useState("1");
    const [behavior, setBehavior] = useState("");
    const [confidenceLevel, setConfidenceLevel] = useState("segura");
    const [isAlert, setIsAlert] = useState(false);
    const [notes, setNotes] = useState("");
    const [photos, setPhotos] = useState<File[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function useMyLocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setError("No se pudo acceder a tu ubiacion")
        );
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!category) {
            setError("Selecciona una categoría.");
            return;
        }
        if (!observedAt) {
            setError("Indica la fecha y hora del avistamiento.");
            return;
        }

        setSubmitting(true);

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            setError("Debes iniciar sesión para publicar una observación.");
            setSubmitting(false);
            return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/observations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                species_id: species?.id ?? null,
                category,
                observed_at: new Date(observedAt).toISOString(),
                latitude: position.lat,
                longitude: position.lng,
                location_name: locationName || null,
                individual_count: individualCount,
                behavior: behavior || null,
                confidence_level: confidenceLevel,
                notes: notes || null,
                is_alert: isAlert,
            }),
        });

        setSubmitting(false);

        if (!res.ok) {
            setError("No se pudo publicar la observación. Intenta de nuevo.");
            return;
        }

        const created = await res.json();

        for (const photo of photos) {
            const formData = new FormData();
            formData.append("file", photo);

            const uploadRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/observations/${created.id}/media`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            if (!uploadRes.ok) {
                console.error("No se pudo subir la foto");
            }
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 bg-paper px-5 pb-24 pt-6 lg:max-w-xl lg:px-0 lg:pb-10">
            <h1 className="font-serif-display text-2xl font-semibold text-ink">Nueva observación</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Fotos (opcional)
                    </label>
                    <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-hairline bg-paper-alt">
                        <CameraIcon />
                        <span className="text-xs text-ink-faint">Toca para agregar fotos</span>
                        <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                        className="hidden"
                        />
                    </label>
                    {photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {photos.map((file, i) => (
                                <img
                                    key={i}
                                    src={URL.createObjectURL(file)}
                                    alt=""
                                    className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Categoría
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => setCategory(c.value)}
                            className={`rounded-full px-3.5 py-2 text-sm ${
                            category === c.value
                                ? "bg-accent font-semibold text-paper"
                                : "border border-hairline bg-white text-ink-muted"
                            }`}
                        >
                            {c.label}
                        </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Especie (opcional)
                    </label>
                    <SpeciesAutocomplete value={species} onSelect={setSpecies} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Fecha y hora
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={observedAt}
                        onChange={(e) => setObservedAt(e.target.value)}
                        className="rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                            Ubicación
                        </label>
                        <button type="button" onClick={useMyLocation} className="text-xs font-semibold text-accent">
                            Usar mi ubicación
                        </button>
                    </div>
                    <div className="h-48 overflow-hidden rounded-xl border border-hairline lg:h-64">
                        <LocationPicker position={position} onChange={setPosition} />
                    </div>
                    <input
                        type="text"
                        placeholder="Nombre del lugar (ej: Playa Cavancha)"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Número de individuos
                    </label>
                    <div className="flex gap-2">
                        {INDIVIDUAL_COUNTS.map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setIndividualCount(n)}
                            className={`rounded-full px-4 py-2 text-sm ${
                            individualCount === n
                                ? "bg-accent font-semibold text-paper"
                                : "border border-hairline bg-white text-ink-muted"
                            }`}
                        >
                            {n}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Comportamiento (opcional)
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: alimentándose, en reposo, migrando…"
                        value={behavior}
                        onChange={(e) => setBehavior(e.target.value)}
                        className="rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Nivel de confianza
                    </label>
                    <div className="flex gap-2">
                        {CONFIDENCE_LEVELS.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => setConfidenceLevel(c.value)}
                            className={`flex-1 rounded-full px-2 py-2 text-xs ${
                            confidenceLevel === c.value
                                ? "bg-accent font-semibold text-paper"
                                : "border border-hairline bg-white text-ink-muted"
                            }`}
                        >
                            {c.label}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-hairline bg-white p-4">
                    <span className="text-sm text-ink">¿Está varado, herido o muerto?</span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isAlert}
                        onClick={() => setIsAlert(!isAlert)}
                        className={`relative h-6 w-10 flex-shrink-0 rounded-full transition-colors ${
                        isAlert ? "bg-alert" : "bg-hairline"
                        }`}
                    >
                        <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            isAlert ? "translate-x-5" : "translate-x-1"
                        }`}
                        />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Notas (opcional)
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Cuéntanos algo más sobre lo que viste…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
                    />
                </div>

                {error && <p className="text-sm text-alert">{error}</p>}

                <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-paper disabled:opacity-60"
                >
                {submitting ? "Publicando…" : "Publicar observación"}
                </button>
            </form>
        </div>
    );
}
function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A8368" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7 L9.5 4.5 L14.5 4.5 L16 7" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  );
}