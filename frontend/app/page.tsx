import { getObservations } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { AuthStatus } from "@/components/AuthStatus";

export default async function feedPage(){
  const observations = await getObservations();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-paper">
      <header className="flex flex-col gap-3 border-b border-hairline px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
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
          <article
            key={obs.id}
            className="flex gap-3.5 rounded-2xl border border-hairline bg-white p-3.5"
          >
            <div className="h-14 w-14 flex-shrink-0 rounded-full bg-accent-soft" />
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
          </article>
        ))}
      </main>
    </div>
  );
}