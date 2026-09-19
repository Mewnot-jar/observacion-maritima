"use client";

import dynamic from "next/dynamic";
import type { Observation } from "@/lib/api";

const ObservationsMap = dynamic(
    () => import("./ObservationsMap").then((mod) => mod.ObservationMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center bg-paper-alt text-sm text-ink-faint">
                Cargando mapa…
            </div>
        ),
    }
);

export function MapLoader({ observations }: { observations: Observation[] }){
    return <ObservationsMap observations={observations}/>;
}