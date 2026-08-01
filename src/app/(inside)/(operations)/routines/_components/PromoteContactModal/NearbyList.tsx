"use client";

import { Badge } from "@/components/Badges";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { NearbyCandidate } from "./interface";

interface Props {
  candidates: NearbyCandidate[];
  selected: string[];
  onToggle: (linkId: string) => void;
}

/**
 * Quem mais está naquela região e merece a viagem.
 *
 * A viagem longa já foi paga: aproveitar clientes urgentes (ou perto disso) no
 * mesmo raio é o que transforma um dia caro num dia cheio. Ordem vem do
 * backend — score primeiro, distância como desempate.
 */
export function NearbyList({ candidates, selected, onToggle }: Props) {
  if (candidates.length === 0) {
    return (
      <Title variant="body-sm" color="muted">
        Não há outros clientes seus por perto que precisem de visita agora. O
        dia vai ficar só com esta.
      </Title>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" color="muted">
        Já que a viagem vai acontecer, estes clientes ficam na mesma região e
        estão pedindo visita. Marque quem você quer atender no mesmo dia.
      </Title>

      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-8">
        {candidates.map((candidate) => {
          const city = candidate.client?.addressCity;
          const state = candidate.client?.addressState;
          return (
            // Sem <label> por fora: o próprio Input.Checkbox já traz o seu, e
            // aninhar dois deixa o clique ambíguo e o campo sem nome acessível.
            <div
              key={candidate.sellerClientFactoryId}
              className="flex items-start gap-10 rounded-(--r-md) border border-(--border) p-10 transition-colors hover:border-(--border2)"
            >
              <Input.Checkbox
                aria-label={`Visitar também ${clientDisplayName(
                  candidate.client,
                  "este cliente"
                )}`}
                checked={selected.includes(candidate.sellerClientFactoryId)}
                onChange={() => onToggle(candidate.sellerClientFactoryId)}
              />
              <div className="min-w-0 flex-1">
                <Title variant="body-sm" weight="medium" className="truncate">
                  {clientDisplayName(candidate.client, "Cliente")}
                </Title>
                <Title variant="micro" color="muted" className="truncate">
                  {factoryName(candidate.factory)}
                </Title>
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <Badge.Root
                    color={candidate.isUrgent ? "red" : "amber"}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      {candidate.isUrgent ? "Urgente" : "Atenção"}
                    </Badge.Text>
                  </Badge.Root>
                  <Title variant="micro" color="muted2">
                    {candidate.distanceKm.toFixed(0)} km daqui
                    {city ? ` · ${city}${state ? `/${state}` : ""}` : ""}
                  </Title>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
