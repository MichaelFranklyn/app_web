"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";
import {
  WALLET_STATUS_COLOR,
  isWalletActive,
  walletStatusLabel,
} from "../../_shared/hygiene/utils";
import { Client } from "../../interface";

interface ClientStatusTagsProps {
  client: Client;
  className?: string;
}

/**
 * Situação do cliente na carteira e o aviso "Precisa de atenção".
 *
 * No desktop ficam ao lado do nome; no cartão do celular, na linha do score
 * (14/11/2026) — ao lado do nome espremiam-no, e na linha do score ocupam a
 * sobra que a barra deixa.
 */
export function ClientStatusTags({ client, className }: ClientStatusTagsProps) {
  const isInactive = !isWalletActive(client.companyClient?.status);
  if (!isInactive && !client.isNeedsAttention) return null;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-8", className)}>
      {/* Só aparece quando a lista mostra quem saiu da carteira (filtro
          "Situação"): na lista padrão todos são ativos. */}
      {isInactive && (
        <Badge.Root
          color={WALLET_STATUS_COLOR[client.companyClient?.status ?? "ACTIVE"]}
          appearance="tinted"
        >
          <Badge.Text>
            {walletStatusLabel(client.companyClient?.status)}
          </Badge.Text>
        </Badge.Root>
      )}
      {client.isNeedsAttention && (
        <Tooltip
          className="max-w-[min(400px,calc(100vw-20px))] whitespace-normal"
          content={
            <div className="flex flex-col gap-2 text-left normal-case">
              <Title variant="label" color="warning">
                Precisa de atenção
              </Title>
              <Title variant="body-sm">
                {client.attentionReason ?? "Revise os dados deste cliente."}
              </Title>
            </div>
          }
        >
          <Badge.Root color="warning" appearance="tinted">
            <Badge.Text>Precisa de atenção</Badge.Text>
          </Badge.Root>
        </Tooltip>
      )}
    </span>
  );
}
