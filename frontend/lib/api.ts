const API_URL = process.env.INTERNAL_API_URL ?? "http://backend:8000";

export type Observation = {
    id: string;
    species_common_name: string | null;
    category: string | null;
    observed_at: string;
    latitude: number;
    longitude: number;
    location_name: string | null;
    individual_count: string | null;
    behavior: string | null;
    confidence_level: string;
    is_alert: boolean;
    is_verified: boolean;
    notes: string | null;
};

export async function getObservations(): Promise<Observation[]> {
    const res = await fetch(`${API_URL}/api/observations`, {
        cache: "no-store"
    });
    if (!res.ok){
        throw new Error(`Error al cargar observaciones: ${res.status}`);
    }

    return res.json();
}