import { getObservations } from "@/lib/api";
import { MapLoader } from "@/components/MapLoader";

export default async function MapaPage() {
    const observations = await getObservations();

    return (
        <div className="isolate h-screen w-full pb-16 lg:pb-0">
            <MapLoader observations={observations} />
        </div>
    );
}