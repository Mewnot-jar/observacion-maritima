import Link from "next/link";
import { getObservations, type Observation } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/labels";
import { AuthStatus } from "@/components/AuthStatus";
import { ArrowRightIcon } from "@/components/Icons";

export default async function feedPage(){
  const observations = await getObservations();

  return (
    <div className="lg:flex lg:items-start lg:gap-6 lg:px-6 lg:py-6">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-paper">
        <header className="flex flex-col gap-3 border-b border-hairline px-5 pb-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif-display text-3xl font-semibold text-ink">Avistamientos</h1>
          <AuthStatus />
        </div>
        <button className="w-fit rounded-full border border-hairline bg-paper-alt px-3 py-1.5 text-sm text-ink-muted">
          Iquique, Tarapacá
        </button>
      </header>

        <main className="flex flex-1 flex-col gap-3.5 px-5 py-4 pb-16">
          {observations.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-faint">
              Todavía no hay avistamientos reportados.
            </p>
          )}

          {observations.map((obs) => (
            <Link
              key={obs.id}
              href={`/observaciones/${obs.id}`}
              className="flex gap-3.5 rounded-2xl border border-hairline bg-white p-3.5"
            >
              {obs.media.length > 0 ? (
                <img 
                  src={obs.media[0].url} 
                  alt=""
                  className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="h-14 w-14 flex-shrink-0 rounded-full bg-accent-soft" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-serif-display text-[17px] font-semibold text-ink">
                    {obs.species_common_name ?? "Sin identificar"}
                  </span>
                  <span className="whitespace-nowrap text-[11px] text-ink-faint">
                    {timeAgo(obs.observed_at)}
                  </span>
                </div>

                <span className="text-xs text-ink-muted">
                  {obs.location_name ?? "Ubicación sin nombre"}
                  {obs.individual_count ? ` · ${obs.individual_count} individuos` : ""}
                </span>

                {obs.is_alert && (
                  <span className="mt-1 w-fit rounded-full bg-alert-soft px-2.5 py-0.5 text-[11px] font-semibold text-alert">
                    Varado
                  </span>
                )}
                {!obs.is_alert && obs.is_verified && (
                  <span className="mt-1 w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                    Verificado
                  </span>
                )}
              </div>
            </Link>
          ))}
        </main>
      </div>
      <FeedSidePanel observations={observations} />
    </div>
  );
}
function FeedSidePanel({ observations }: { observations: Observation[] }) {
  const alertCount = observations.filter((o) => o.is_alert).length;
  const speciesCount = new Set(
    observations.map((o) => o.species_common_name).filter(Boolean)
  ).size;

  const categoryCounts = observations.reduce<Record<string, number>>((acc, o) => {
    if (!o.category) return acc;
    acc[o.category] = (acc[o.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="hidden w-[300px] flex-shrink-0 flex-col gap-6 lg:flex">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Resumen</h2>
        <div className="flex gap-2">
          <StatTile value={observations.length} label="En el feed" />
          <StatTile value={alertCount} label="Alertas" tone="alert" />
          <StatTile value={speciesCount} label="Especies" />
        </div>
      </div>

      {Object.keys(categoryCounts).length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Categorías</h2>
          <div className="flex flex-col gap-1.5 rounded-xl border border-hairline bg-white p-3.5">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-sm text-ink">
                <span>{CATEGORY_LABELS[category] ?? category}</span>
                <span className="text-ink-faint">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/mapa"
        className="flex items-center justify-between rounded-xl border border-hairline bg-white p-4 text-sm font-semibold text-ink"
      >
        Ver mapa completo
        <ArrowRightIcon />
      </Link>
    </aside>
  );
}

function StatTile({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "alert";
}) {
  return (
    <div className="flex-1 rounded-xl border border-hairline bg-white p-3">
      <div className={`font-serif-display text-xl font-semibold ${tone === "alert" ? "text-alert" : "text-ink"}`}>
        {value}
      </div>
      <div className="text-[11px] text-ink-faint">{label}</div>
    </div>
  );
}