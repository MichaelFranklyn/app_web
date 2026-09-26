"use client";
import { MapFrame } from "@/components/MapFrame";

import { getButtonClasses } from "@/components/Button/Root/style";
import { ExternalLink, MapPin } from "lucide-react";

interface Props {
  /** Endereço no formato do Maps (`mapsAddressQuery`); null = sem endereço. */
  query: string | null;
}

// A chave vai no bundle (inerente à Maps Embed API client-side) — a mesma do
// mapa da rota do dia, restrita por referrer no Google Cloud Console.
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Link externo precisa ser <a>, não <button>: usa só a classe do botão.
const linkClass = getButtonClasses({
  appearance: "outline",
  color: "neutral",
  size: "sm",
  isIconOnly: false,
  fullWidth: false,
  active: false,
  noPadding: false,
  noUppercase: true,
});

/**
 * O endereço do cliente no mapa. Embutido quando há chave do Google Maps; o
 * link "Abrir no Google Maps" não precisa de chave e fica sempre — é por ele
 * que o vendedor pede a rota no celular.
 */
export function AddressMap({ query }: Props) {
  if (!query) {
    return (
      <MapFrame.Root className="h-[200px]">
        <MapFrame.Message icon={MapPin}>
          Sem endereço para mostrar no mapa. Preencha rua ou cidade em
          &quot;Editar&quot;.
        </MapFrame.Message>
      </MapFrame.Root>
    );
  }

  const q = encodeURIComponent(query);
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className="flex flex-col gap-8">
      <MapFrame.Root className="h-[220px]">
        {MAPS_KEY ? (
          <MapFrame.Embed
            title="Mapa do endereço do cliente"
            src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${q}`}
          />
        ) : (
          <MapFrame.Message icon={MapPin}>
            Mapa embutido indisponível (chave do Google Maps não configurada).
          </MapFrame.Message>
        )}
      </MapFrame.Root>
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkClass} self-start`}
      >
        <ExternalLink size={14} />
        Abrir no Google Maps
      </a>
    </div>
  );
}
