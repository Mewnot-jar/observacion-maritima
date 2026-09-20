"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [-20.22, -70.15];

const pinIcon = L.divIcon({
    className: "",
    html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#2F6F62" stroke="#FBF8F1" stroke-width="1.3">
        <path d="M12 21 C12 21 19 14.5 19 9.5 C19 5.9 15.9 3 12 3 C8.1 3 5 5.9 5 9.5 C5 14.5 12 21 12 21 Z"/>
    </svg>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

type LatLng = {lat: number, lng: number};

function ClickHandler({ onPick }: { onPick: (pos: LatLng) => void }) {
    useMapEvents({
        click(e) {
            onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export function LocationPicker({
    position,
    onChange,
}: {
    position: LatLng;
    onChange: (pos: LatLng) => void;
}) {
    return (
        <MapContainer center={DEFAULT_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]} icon={pinIcon} />
            <ClickHandler onPick={onChange} />
        </MapContainer>
    );
}