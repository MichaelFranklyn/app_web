"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsLoader";
import { scoreLevel, type ScoreTone } from "@/utils/score";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useQuery } from "@apollo/client/react";
import { MapPin, Radar } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { RADAR_CLIENTS_QUERY } from "./gql";
import { RadarClient, RadarClientsQueryData } from "./interface";

interface Props {
  /** Vendedor selecionado (gestor) — só para revalidar ao trocar de vendedor. */
  sellerId: string | null;
}

// Cor do marcador por tom de score (alto = urgente/vermelho). Hex fixo porque o
// pino do mapa é desenhado fora do CSS (não enxerga as variáveis do tema).
const TONE_HEX: Record<ScoreTone, string> = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  blue: "#3b82f6",
  green: "#22c55e",
  cyan: "#06b6d4",
  neutral: "#6b7280",
};

const scoreNumber = (c: RadarClient): number =>
  c.companyClient?.visitScoreTotal
    ? Number(c.companyClient.visitScoreTotal)
    : 0;

const formatAddress = (c: RadarClient): string => {
  const street = [c.addressStreet, c.addressNumber].filter(Boolean).join(", ");
  const city = [c.addressCity, c.addressState].filter(Boolean).join(" - ");
  return [street, c.addressNeighborhood, city].filter(Boolean).join(" · ");
};

export function RadarMap({ sellerId }: Props) {
  const { ready, error: mapError, missingKey } = useGoogleMapsLoader();
  const { data, loading, error, refetch } = useQuery<RadarClientsQueryData>(
    RADAR_CLIENTS_QUERY,
    { fetchPolicy: "cache-and-network" }
  );

  const clients = useMemo(() => data?.radarClients ?? [], [data]);
  const [selected, setSelected] = useState<RadarClient | null>(null);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  // (Re)desenha marcadores + clustering sempre que o mapa fica pronto ou a
  // carteira muda. O clustering é o que revela "lojas próximas umas das outras".
  useEffect(() => {
    if (!ready || !mapDivRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapDivRef.current, {
        center: { lat: -14.235, lng: -51.925 }, // Brasil (fallback antes do fitBounds)
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }
    const map = mapRef.current;

    clustererRef.current?.clearMarkers();

    const bounds = new google.maps.LatLngBounds();
    const markers = clients
      .map((client) => {
        const lat = Number(client.latitude);
        const lng = Number(client.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const tone = scoreLevel(scoreNumber(client)).tone;
        const marker = new google.maps.Marker({
          position: { lat, lng },
          title: client.nomeFantasia || client.razaoSocial,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: TONE_HEX[tone] ?? TONE_HEX.neutral,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        marker.addListener("click", () => {
          setSelected(client);
          map.panTo({ lat, lng });
        });
        bounds.extend({ lat, lng });
        return marker;
      })
      .filter((m): m is google.maps.Marker => m !== null);

    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }
    clustererRef.current.addMarkers(markers);

    if (markers.length) map.fitBounds(bounds, 64);

    return () => {
      clustererRef.current?.clearMarkers();
    };
  }, [ready, clients]);

  if (missingKey) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <MapPin />
        </EmptyState.Icon>
        <EmptyState.Title>Mapa indisponível</EmptyState.Title>
        <EmptyState.Description>
          Configure a chave do Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
          para usar o radar de proximidade.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  if (error) return <QueryError onRetry={() => refetch()} />;

  const showEmpty = !loading && ready && clients.length === 0;

  return (
    <div
      className="desktop:flex-row flex flex-col gap-16"
      data-tour="routines-radar"
    >
      <div className="relative min-h-[520px] flex-1 overflow-hidden rounded-(--r-xl) border border-(--border) bg-(--bg3)">
        <div ref={mapDivRef} className="h-full min-h-[520px] w-full" />
        {(!ready || loading) && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-(--bg3)/60">
            <Loading.Spinner />
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center px-24 text-center">
            <Title variant="body-sm" color="muted">
              Não foi possível carregar o mapa. Verifique a conexão e as
              restrições da chave do Google Maps.
            </Title>
          </div>
        )}
        {showEmpty && (
          <div className="absolute inset-0 flex items-center justify-center px-24 text-center">
            <Title variant="body-sm" color="muted">
              Nenhum cliente com endereço localizável na carteira ainda. Os
              clientes ganham posição no mapa conforme são geocodificados.
            </Title>
          </div>
        )}
      </div>

      <div className="desktop:w-[320px]">
        <Card.Root>
          <Card.Header>
            <div className="flex items-center gap-8">
              <Radar size={16} className="text-(--amber)" />
              <Title variant="body-sm" weight="semibold">
                Loja selecionada
              </Title>
            </div>
          </Card.Header>
          <Card.Body>
            {selected ? (
              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                  <Title variant="body-sm" weight="semibold">
                    {selected.nomeFantasia || selected.razaoSocial}
                  </Title>
                  {selected.nomeFantasia && (
                    <Title variant="micro" color="muted">
                      {selected.razaoSocial}
                    </Title>
                  )}
                </div>

                <Badge.Root
                  color={scoreLevel(scoreNumber(selected)).tone}
                  appearance="tinted"
                >
                  <Badge.Text>
                    {scoreLevel(scoreNumber(selected)).label}
                  </Badge.Text>
                </Badge.Root>

                <Title variant="micro" color="muted">
                  {formatAddress(selected) || "Sem endereço detalhado."}
                </Title>

                {selected.companyClient && (
                  <Link
                    href={`/clients/${selected.companyClient.id}/overview`}
                    className="mt-4"
                  >
                    <Button.Root
                      appearance="tinted"
                      color="amber"
                      size="sm"
                      noUppercase
                      fullWidth
                    >
                      <Button.Title>Abrir cliente</Button.Title>
                    </Button.Root>
                  </Link>
                )}
              </div>
            ) : (
              <Title variant="micro" color="muted">
                Clique num pino do mapa para ver a loja. Pinos agrupados indicam
                lojas próximas umas das outras.
              </Title>
            )}
          </Card.Body>
        </Card.Root>
      </div>
    </div>
  );
}
