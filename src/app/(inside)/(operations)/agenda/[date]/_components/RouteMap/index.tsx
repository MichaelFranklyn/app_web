"use client";
import { Button } from "@/components/Button";
import { MapFrame } from "@/components/MapFrame";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { ExternalLink, MapPin } from "lucide-react";
import { VisitItem } from "../../interface";
import { formatDistanceKm, mapsQuery } from "../../utils";

interface Props {
  stops: VisitItem[];
  distanceKm: string;
  departureAddress?: string | null;
}

// A chave vai no bundle (inerente à Maps Embed API client-side). Para evitar
// abuso de billing, restrinja-a por referrer HTTP no Google Cloud Console
// (Credenciais → restrições de aplicativo → sites) aos domínios do app.
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function RouteMap({ stops, distanceKm, departureAddress }: Props) {
  // Endereços utilizáveis das paradas, na ordem da rota.
  const points = stops
    .map((s) => mapsQuery(s.clientFactoryLink?.client ?? null))
    .filter((q): q is string => Boolean(q));
  const hasPoints = points.length > 0;

  // Origem = ponto de partida (se houver) senão a 1ª parada; destino = última.
  const origin = departureAddress || points[0] || "";
  const destination = points[points.length - 1] || origin;
  const waypoints = departureAddress
    ? points.slice(0, -1)
    : points.slice(1, -1);

  const enc = encodeURIComponent;

  // Link universal "Abrir no Google Maps" — NÃO precisa de chave.
  const externalUrl = (() => {
    if (!hasPoints) return null;
    const params = new URLSearchParams({ api: "1", travelmode: "driving" });
    if (origin) params.set("origin", origin);
    params.set("destination", destination);
    if (waypoints.length) params.set("waypoints", waypoints.join("|"));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  })();

  // URL do iframe (Embed API) — precisa de chave. place p/ 1 ponto, directions p/ vários.
  const embedUrl = (() => {
    if (!MAPS_KEY || !hasPoints) return null;
    if (points.length === 1 && !departureAddress) {
      return `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${enc(points[0])}`;
    }
    const wp = waypoints.map(enc).join("|");
    const base = `https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${enc(origin)}&destination=${enc(destination)}&mode=driving`;
    return wp ? `${base}&waypoints=${wp}` : base;
  })();

  return (
    <div className="flex flex-col gap-10">
      <MapFrame.Root className="h-[360px]">
        {embedUrl ? (
          <MapFrame.Embed title="Mapa da rota" src={embedUrl} />
        ) : (
          <MapFrame.Message icon={MapPin}>
            <Title variant="body-sm" color="muted">
              {!hasPoints
                ? "As paradas deste dia ainda não têm endereço cadastrado para traçar a rota."
                : MAPS_KEY
                  ? "Não foi possível carregar o mapa interativo. Abra a rota completa no Google Maps."
                  : "Mapa interativo indisponível (configure a chave do Google Maps). Você ainda pode abrir a rota completa no app do Google Maps."}
            </Title>
            {externalUrl && (
              <Button.Link
                href={externalUrl}
                external
                appearance="tinted"
                size="sm"
                noUppercase
              >
                <Button.Icon icon={ExternalLink} />
                <Button.Title>Abrir rota no Google Maps</Button.Title>
              </Button.Link>
            )}
          </MapFrame.Message>
        )}
      </MapFrame.Root>

      <div className="flex flex-wrap items-center justify-between gap-8">
        <Badge.Root color="neutral" appearance="tinted">
          <Badge.Text>
            {formatDistanceKm(distanceKm)} · {stops.length} paradas
          </Badge.Text>
        </Badge.Root>
        {/* Botão sempre disponível quando o mapa embutido está visível. */}
        {embedUrl && externalUrl && (
          <Button.Link
            href={externalUrl}
            external
            appearance="tinted"
            size="sm"
            noUppercase
          >
            <Button.Icon icon={ExternalLink} />
            <Button.Title>Abrir no Google Maps</Button.Title>
          </Button.Link>
        )}
      </div>
    </div>
  );
}
