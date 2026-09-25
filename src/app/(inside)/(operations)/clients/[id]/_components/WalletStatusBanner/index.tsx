"use client";

import { Alert } from "@/components/Alert";
import { formatDateDMY } from "@/utils/format/masks";
import { ArrowRightLeft, Info, UserMinus } from "lucide-react";
import Link from "next/link";
import { walletStatusLabel } from "../../../_shared/hygiene/utils";
import { WalletSituation } from "../../interface";
import { formatCnpj } from "../../utils";

interface Props {
  situation: WalletSituation;
}

/**
 * O aviso no topo da ficha quando o cliente não está (ou não estava) na
 * carteira ativa.
 *
 * Quem abre a ficha de um cliente encerrado precisa saber de cara por que ele
 * não aparece na rotina nem aceita pedido — senão procura o defeito. E na troca
 * de CNPJ os dois lados se apontam: a ficha antiga leva à nova (é lá que a
 * relação continua) e a nova diz de onde veio (é lá que estão os pedidos
 * antigos).
 */
export function WalletStatusBanner({ situation }: Props) {
  const { status, statusReason, statusChangedAt, succeededBy, succeededFrom } =
    situation;
  const since = statusChangedAt ? ` em ${formatDateDMY(statusChangedAt)}` : "";
  const reason = statusReason ? ` Motivo: ${statusReason}.` : "";

  if (status === "SUCCEEDED" && succeededBy) {
    return (
      <Alert.Root variant="info">
        <Alert.Icon icon={ArrowRightLeft} />
        <Alert.Content>
          <Alert.Title>Este cliente mudou de CNPJ{since}</Alert.Title>
          <Alert.Description>
            A relação continua no CNPJ novo
            {succeededBy.client
              ? ` (${formatCnpj(succeededBy.client.cnpj)})`
              : ""}
            . Aqui ficam os pedidos antigos, feitos no CNPJ anterior.{reason}{" "}
            <Link
              href={`/clients/${succeededBy.id}/overview`}
              className="font-(--weight-medium) underline"
            >
              Abrir o cadastro do CNPJ novo
            </Link>
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (status !== "ACTIVE") {
    return (
      <Alert.Root variant="neutral">
        <Alert.Icon icon={UserMinus} />
        <Alert.Content>
          <Alert.Title>
            {walletStatusLabel(status)}
            {since}
          </Alert.Title>
          <Alert.Description>
            Este cliente está fora da carteira ativa: não entra na rotina de
            visitas, não aceita pedidos novos e não aparece nas listas.{reason}{" "}
            O histórico continua aqui. Para voltar a atendê-lo, use “Situação do
            cliente” → “Reativar cliente”.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (succeededFrom) {
    return (
      <Alert.Root variant="info">
        <Alert.Icon icon={Info} />
        <Alert.Content>
          <Alert.Description>
            Este cadastro veio de uma troca de CNPJ. Os pedidos feitos no CNPJ
            anterior
            {succeededFrom.client
              ? ` (${formatCnpj(succeededFrom.client.cnpj)})`
              : ""}{" "}
            estão no{" "}
            <Link
              href={`/clients/${succeededFrom.id}/overview`}
              className="font-(--weight-medium) underline"
            >
              cadastro antigo
            </Link>
            .
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return null;
}
