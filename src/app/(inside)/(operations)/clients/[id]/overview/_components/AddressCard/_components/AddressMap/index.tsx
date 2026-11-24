"use client";
import { MapFrame } from "@/components/MapFrame";

import { MapPin } from "lucide-react";

interface Props {
  /** Endereço no formato do Maps (`mapsAddressQuery`); null = sem endereço. */
  query: string | null;
}

// A chave vai no bundle (inerente à Maps Embed API client-side) — a mesma do
// mapa da rota do dia, restrita por referrer no Google Cloud Console.
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * O endereço do cliente no mapa, embutido quando há chave do Google Maps.
 * O botão "Abrir no Google Maps" saiu a pedido do usuário (14/11/2026): o
 * próprio mapa embutido já traz o "Ver mapa ampliado" para quem quer a rota.
 */
export function AddressMap({ query }: Props) {
  if (!query) {
    return (
      <MapFrame.Root className="h-[200px]">
        <MapFrame.Message icon={MapPin}>
          Sem endereço para mostrar no mapa. Preencha rua ou cidade em “Editar
          endereço”.
        </MapFrame.Message>
      </MapFrame.Root>
    );
  }

  const q = encodeURIComponent(query);

  return (
    <MapFrame.Root className="h-[220px]">
      {MAPS_KEY ? (
        <MapFrame.Embed
          title="Mapa do endereço do cliente"
          src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${q}`}
        />
      ) : (
        <MapFrame.Message icon={MapPin}>
          O mapa não está disponível agora.
        </MapFrame.Message>
      )}
    </MapFrame.Root>
  );
}
