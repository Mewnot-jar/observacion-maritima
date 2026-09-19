"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Observation } from "@/lib/api";
import { timeAgo } from "@/lib/format";

const DEFAULT_CENTER: [number, number] = [-20.22, -70.15];

function createPinIcon(color: string) {
    return L.divIcon({
        className: "",
        html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="#FBF8F1" stroke-width="1.3">
                <path d="M12 21 C12 21 19 14.5 19 9.5 C19 5.9 15.9 3 12 3 C8.1 3 5 5.9 5 9.5 C5 14.5 12 21 12 21 Z"/>
                </svg>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
    });
}

const normalIcon = createPinIcon("#2F6F62");
const alertIcon = createPinIcon("#B3401D");

export function ObservationMap({ observations }: { observations: Observation[] }){
    return (
        <MapContainer center={DEFAULT_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {observations.map((obs) => (
                <Marker
                    key={obs.id}
                    position={[obs.latitude, obs.longitude]}
                    icon={obs.is_alert ? alertIcon : normalIcon}
                >
                    <Popup>
                        <div className="flex flex-col gap-1">
                            <span className="font-serif-display text-sm font-semibold text-ink">
                                {obs.species_common_name ?? "Sin identificar"}
                            </span>
                            <span className="text-xs text-ink-muted">
                                {obs.location_name ?? "Ubicación sin nombre"} · {timeAgo(obs.observed_at)}
                            </span>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}