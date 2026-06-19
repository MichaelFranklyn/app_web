import { Badge } from "@/components/Badges";
import { MapPin } from "lucide-react";
import { formatDistanceKm } from "../../utils";

interface Props {
  stopsCount: number;
  distanceKm: string;
}

export function RouteMapPlaceholder({ stopsCount, distanceKm }: Props) {
  return (
    <div className="flex h-[360px] flex-col items-center justify-center gap-8 rounded-(--r-xl) border border-(--border) bg-(--bg3)">
      <MapPin size={32} className="text-(--muted2)" />
      <div className="text-[13px] text-(--muted)">
        Mapa de rota — integração Google Maps
      </div>
      <Badge.Root color="neutral" appearance="tinted">
        <Badge.Text>
          {formatDistanceKm(distanceKm)} · {stopsCount} paradas
        </Badge.Text>
      </Badge.Root>
    </div>
  );
}
