import Link from "next/link";
import { notFound } from "next/navigation";
import { getObservation } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { CATEGORY_LABELS, CONFIDENCE_LABELS } from "@/lib/labels";
import { ModerationPanel } from "@/components/ModerationPanel";

export default async function ObservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const observation = await getObservation(id);

  if (!observation) notFound(); // Next.js muestra su página 404 por defecto

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-paper pb-20 lg:max-w-4xl lg:pb-10">
      <header className="px-5 pb-2 pt-6 lg:px-0 lg:mt-5">
        <Link href="/" className="flex w-fit items-center gap-1 text-sm text-ink-muted">
          <BackIcon />
          Volver
        </Link>
      </header>

      <div className="lg:flex lg:gap-8">
        {observation.media.length > 0 ? (
          <img 
            src={observation.media[0].url} 
            alt={observation.species_common_name ?? ""}
            className="h-56 w-full object-cover lg:h-[420px] lg:w-[420px] lg:flex-shrink-0 lg:rounded-2xl"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-accent-soft lg:h-[420px] lg:w-[420px] lg:flex-shrink-0 lg:rounded-2xl">
            <CategoryIcon category={observation.category} />
          </div>
        )}
        <div className="flex flex-col gap-5 px-5 pt-5 lg:flex-1 lg:px-0 lg:pt-0">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif-display text-2xl font-semibold text-ink">
              {observation.species_common_name ?? "Sin identificar"}
            </h1>
            {observation.species_scientific_name && (
              <span className="text-sm italic text-ink-faint">
                {observation.species_scientific_name}
              </span>
            )}
            <span className="mt-1 w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
              Confianza: {CONFIDENCE_LABELS[observation.confidence_level] ?? observation.confidence_level}
            </span>
          </div>

          {observation.is_alert && (
            <div className="flex items-start gap-2.5 rounded-xl border border-alert/30 bg-alert-soft p-4">
              <AlertIcon />
              <span className="text-sm text-ink">
                Marcado como alerta — posible individuo varado, herido o muerto.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {observation.location_name && (
              <div className="flex items-center gap-2.5 text-sm text-ink">
                <PinIcon />
                {observation.location_name}
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <CalendarIcon />
              {new Date(observation.observed_at).toLocaleString("es-CL", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              <span className="text-ink-faint">· {timeAgo(observation.observed_at)}</span>
            </div>
            {observation.reporter_name && (
              <div className="flex items-center gap-2.5 text-sm text-ink">
                <UserIcon />
                Reportado por {observation.reporter_name}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <InfoCard label="Individuos" value={observation.individual_count ?? "—"} />
            <InfoCard label="Comportamiento" value={observation.behavior ?? "No registrado"} />
            <InfoCard
              label="Categoría"
              value={CATEGORY_LABELS[observation.category ?? ""] ?? "Sin categoría"}
            />
            <InfoCard
              label="Estado"
              value={
                observation.is_alert
                  ? "Alerta activa"
                  : observation.is_verified
                    ? "Verificado"
                    : "Sin verificar"
              }
              tone={observation.is_alert ? "alert" : observation.is_verified ? "accent" : "muted"}
            />
          </div>

          {observation.notes && (
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Notas</h2>
              <p className="text-sm leading-relaxed text-ink">{observation.notes}</p>
            </div>
          )}
          <ModerationPanel observationId={observation.id} initialIsVerified={observation.is_verified} />
          <span className="text-xs text-ink-faint">
            {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent" | "alert" | "muted";
}) {
  const toneClass =
    tone === "accent" ? "text-accent" : tone === "alert" ? "text-alert" : tone === "muted" ? "text-ink-faint" : "text-ink";

  return (
    <div className="rounded-xl border border-hairline bg-white p-3.5">
      <div className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</div>
      <div className={`mt-0.5 font-serif-display text-base font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string | null }) {
  const stroke = "#2F6F62";
  if (category === "ave") {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 15 C6 9 9 15 12 10 C15 15 18 9 22 15" />
      </svg>
    );
  }
  if (category === "mamifero_marino") {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="15" r="4" />
        <circle cx="7" cy="9" r="1.6" />
        <circle cx="12" cy="6.5" r="1.6" />
        <circle cx="17" cy="9" r="1.6" />
      </svg>
    );
  }
  if (category === "pez") {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12 C6 7 14 7 18 12 C14 17 6 17 3 12 Z" />
        <path d="M18 12 L22 8 L22 16 Z" />
      </svg>
    );
  }
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9 a2.5 2.5 0 1 1 3.5 2.3 c-1 .5 -1 1.2 -1 2.2" />
      <circle cx="12" cy="17" r="0.6" fill={stroke} stroke="none" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3401D" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
      <path d="M12 3 L22 20 L2 20 Z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17" r="1" fill="#B3401D" stroke="none" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M12 21 C12 21 19 14.5 19 9.5 C19 5.9 15.9 3 12 3 C8.1 3 5 5.9 5 9.5 C5 14.5 12 21 12 21 Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20 C4 15.6 7.6 13 12 13 C16.4 13 20 15.6 20 20" />
    </svg>
  );
}