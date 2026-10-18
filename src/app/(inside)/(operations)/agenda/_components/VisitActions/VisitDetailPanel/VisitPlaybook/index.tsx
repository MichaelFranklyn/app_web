"use client";
import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { VISIT_PLAYBOOK } from "./gql";
import { VisitPlaybookData } from "./interface";
import { PlaybookFactoryCard } from "./PlaybookFactoryCard";
import { hasTalkingPoints } from "./utils";

interface Props {
  itemId: string;
  /** Só busca com o painel aberto: a rota do dia tem dezenas de paradas. */
  open: boolean;
}

const HELP = (
  <p>
    Sai dos pedidos que o cliente fez nas fábricas que você atende nele.
    Aparecem o que está na hora de repor, o que atrasou e o que ele deixou de
    comprar neste último ano, além da promoção relâmpago que vale hoje. Produto
    que ele compra dentro do ritmo não aparece.
  </p>
);

/**
 * "O que oferecer" — a segunda metade do roteiro da visita. O "por que ir" fica
 * logo acima, no motivo do score; aqui vem o que falar quando entrar na loja.
 */
export function VisitPlaybook({ itemId, open }: Props) {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery<VisitPlaybookData>(
    VISIT_PLAYBOOK,
    { variables: { itemId }, skip: !open, fetchPolicy: "cache-and-network" }
  );

  const playbook = data?.visitPlaybook;
  const factories = (playbook?.factories ?? []).filter(hasTalkingPoints);
  const clientId = playbook?.companyClientId;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-6">
        <Title variant="micro" color="muted">
          O que oferecer
        </Title>
        <HelpTooltip label="De onde vem a sugestão?" content={HELP} />
      </div>

      {loading && !playbook ? (
        <Loading.Skeleton className="h-[120px] w-full" />
      ) : error && !playbook ? (
        <QueryError flat onRetry={() => refetch()} />
      ) : factories.length === 0 ? (
        <Title variant="body-xs" color="muted">
          Nada atrasado nem em promoção: o cliente está comprando no ritmo dele.
        </Title>
      ) : (
        factories.map((entry) => (
          <PlaybookFactoryCard
            key={entry.sellerClientFactoryId}
            entry={entry}
            onOpenOrder={(orderId) => router.push(`/orders/${orderId}`)}
          />
        ))
      )}

      {clientId && (
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          onClick={() => router.push(`/clients/${clientId}/products`)}
        >
          <Button.Icon icon={PackageSearch} />
          <Button.Title>Ver tudo o que ele compra</Button.Title>
        </Button.Root>
      )}
    </div>
  );
}
