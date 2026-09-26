"use client";

import { getButtonClasses } from "@/components/Button/Root/style";
import { Title } from "@/components/Title";
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
      <div className="flex h-50 flex-col items-center justify-center gap-8 rounded-(--r-lg) border border-(--border) bg-(--bg3) px-16 text-center">
        <MapPin size={24} strokeWidth={1.5} className="text-(--muted2)" />
        <Title variant="body-xs" color="muted2">
          Sem endereço para mostrar no mapa. Preencha rua ou cidade em
          &quot;Editar&quot;.
        </Title>
      </div>
    );
  }

  const q = encodeURIComponent(query);
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="h-[220px] overflow-hidden rounded-(--r-lg) border border-(--border) bg-(--bg3)">
        {MAPS_KEY ? (
          <iframe
            title="Mapa do endereço do cliente"
            src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${q}`}
            className="h-full w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-8 px-16 text-center">
            <MapPin size={24} strokeWidth={1.5} className="text-(--muted2)" />
            <Title variant="body-xs" color="muted2">
              Mapa embutido indisponível (chave do Google Maps não configurada).
            </Title>
          </div>
        )}
      </div>
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
