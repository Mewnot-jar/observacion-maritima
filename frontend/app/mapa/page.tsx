import { getObservations } from "@/lib/api";
import { MapLoader } from "@/components/MapLoader";

export default async function MapaPage() {
    const observations = await getObservations();

    return (
        <div className="h-screen w-full pb-16">
            <MapLoader observations={observations} />
        </div>
    );
}