"use client";

import { Card } from "@/components/Card";
import { useMemo } from "react";
import { useClientRoute } from "../context";
import { useClientFactoryLinks } from "../useClientFactoryLinks";
import { buildAddress } from "../utils";
import { AddressCard } from "./_components/AddressCard";
import { ContactCard } from "./_components/ContactCard";
import { NotesCard } from "./_components/NotesCard";
import { SummaryCard } from "./_components/SummaryCard";

export default function OverviewContent() {
  // A ficha vem do layout, que já a buscou para o cabeçalho. A aba pedia os
  // MESMOS campos numa segunda query (`CLIENT_QUERY`) que, por depender deste
  // `clientId`, só saía depois da primeira voltar — dois saltos de rede em
  // série por um dado que já estava na mão. Ver `context.tsx`.
  const {
    clientId: id,
    client,
    updateOptimistic,
    commit,
    rollback,
    refetch,
  } = useClientRoute();

  // Só alimenta a data da última visita no resumo ao lado. É uma consulta
  // pesada (cadência, scores, fábrica e vendedor de cada vínculo) e por isso
  // NÃO segura a tela: endereço, contato e notas já estão prontos e aparecem na
  // hora — só o campo dela espera, com o próprio "carregando". A mesma busca
  // serve a aba Fábricas, e as duas dividem a resposta no cache.
  const { links, loading: linksLoading } = useClientFactoryLinks(id);

  const lastVisitDate = useMemo(
    () =>
      links
        .reduce<string | null>((latest, c) => {
          if (!c.lastVisitDate) return latest;
          if (!latest || c.lastVisitDate > latest) return c.lastVisitDate;
          return latest;
        }, null)
        ?.split("T")[0] ?? "—",
    [links]
  );

  return (
    <div className="desktop:flex-row desktop:items-start flex flex-col gap-20">
      {/* Endereço + Contato: mesma largura, empilhados → colapsam juntos. */}
      <Card.Header.Group>
        <div className="flex min-w-0 flex-1 flex-col gap-16">
          <AddressCard
            clientId={id}
            address={buildAddress(client)}
            currentAddress={client}
            onUpdateOptimistic={updateOptimistic}
            onCommit={commit}
            onRollback={rollback}
          />

          <ContactCard clientId={id} />
        </div>
      </Card.Header.Group>

      <div className="desktop:w-[260px] flex w-full shrink-0 flex-col gap-12">
        <SummaryCard
          lastVisitDate={lastVisitDate}
          lastVisitLoading={linksLoading}
          cnae={client.cnae ?? "—"}
          cnaeDescription={client.cnaeDescription ?? null}
          networkName={client.companyClient?.network?.name ?? null}
          segmentName={client.companyClient?.segment?.name ?? null}
        />

        <NotesCard
          companyClientId={client.companyClient?.id ?? ""}
          companyClient={client.companyClient ?? null}
          notes={client.companyClient?.notes || ""}
          onUpdated={refetch}
          onUpdateOptimistic={updateOptimistic}
          onCommit={commit}
          onRollback={rollback}
        />
      </div>
    </div>
  );
}
