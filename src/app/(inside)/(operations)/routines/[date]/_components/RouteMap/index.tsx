"use client";

import { Badge } from "@/components/Badges";
import { getButtonClasses } from "@/components/Button/Root/style";
import { Title } from "@/components/Title";
import { ExternalLink, MapPin } from "lucide-react";
import { VisitItem } from "../../interface";
import { formatDistanceKm, mapsQuery } from "../../utils";

interface Props {
  stops: VisitItem[];
  distanceKm: string;
  departureAddress?: string | null;
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Classe de botão âmbar (link externo precisa ser <a>, não <button>).
const ctaClass = getButtonClasses({
  appearance: "tinted",
  color: "amber",
  size: "sm",
  isIconOnly: false,
  fullWidth: false,
  active: false,
  noPadding: false,
  noUppercase: true,
});

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
      <div className="relative h-[360px] overflow-hidden rounded-(--r-xl) border border-(--border) bg-(--bg3)">
        {embedUrl ? (
          <iframe
            title="Mapa da rota"
            src={embedUrl}
            className="h-full w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-10 px-24 text-center">
            <MapPin size={32} className="text-(--muted2)" />
            <Title variant="body-sm" color="muted">
              {!hasPoints
                ? "As paradas deste dia ainda não têm endereço cadastrado para traçar a rota."
                : MAPS_KEY
                  ? "Não foi possível carregar o mapa interativo. Abra a rota completa no Google Maps."
                  : "Mapa interativo indisponível (configure a chave do Google Maps). Você ainda pode abrir a rota completa no app do Google Maps."}
            </Title>
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClass}
              >
                <ExternalLink size={14} />
                Abrir rota no Google Maps
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-8">
        <Badge.Root color="neutral" appearance="tinted">
          <Badge.Text>
            {formatDistanceKm(distanceKm)} · {stops.length} paradas
          </Badge.Text>
        </Badge.Root>
        {/* Botão sempre disponível quando o mapa embutido está visível. */}
        {embedUrl && externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClass}
          >
            <ExternalLink size={14} />
            Abrir no Google Maps
          </a>
        )}
      </div>
    </div>
  );
}
