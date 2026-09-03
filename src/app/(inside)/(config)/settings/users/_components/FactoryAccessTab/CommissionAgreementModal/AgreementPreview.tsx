"use client";

import { Alert } from "@/components/Alert";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Lightbulb } from "lucide-react";

import { agreementPreview, percentText } from "../utils";

interface Props {
  /** O que está digitado no campo; `null` = em branco (comissão inteira). */
  share: number | null;
  /** A comissão que a fábrica paga à empresa, em %. */
  factoryRate: number;
}

/** Uma linha do quadro: quem, quanto, e por quê. */
function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-12">
      <Title variant="body-sm" color="muted">
        {label}
      </Title>
      <Title variant="body-sm" weight={strong ? "bold" : "semibold"}>
        {value}
      </Title>
    </div>
  );
}

/**
 * O acordo traduzido em dinheiro, num pedido de R$ 10.000.
 *
 * O campo pergunta a fatia DA COMISSÃO, e é natural digitar ali a taxa do
 * vendedor sobre o PEDIDO — a dica escrita não impediu que acontecesse na
 * carteira de verdade. Um número em reais impede: ninguém combina R$ 21,00 de
 * comissão com um vendedor e acha que está certo.
 *
 * Quando o percentual digitado é menor que a comissão da própria fábrica, a
 * prévia oferece a conversão em vez de acusar erro — pode ser exatamente o que
 * a pessoa quis, e a decisão continua sendo dela.
 */
export function AgreementPreview({ share, factoryRate }: Props) {
  // Sem a taxa da fábrica não há o que traduzir: o quadro inteiro sai.
  if (!factoryRate) return null;

  const preview = agreementPreview(share, factoryRate);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 rounded-(--r-md) bg-(--bg3) p-16">
        <Title variant="label" color="muted">
          Num pedido de {formatMoney(preview.orderAmount)}
        </Title>
        <Row
          label={`A fábrica paga de comissão (${percentText(factoryRate)}%)`}
          value={formatMoney(preview.factoryCommission)}
        />
        <Row
          label={
            share === null
              ? "O vendedor recebe (comissão inteira)"
              : `O vendedor recebe (${percentText(share)}% da comissão)`
          }
          value={formatMoney(preview.sellerAmount)}
          strong
        />
        <Row
          label="Fica no escritório"
          value={formatMoney(preview.officeAmount)}
        />
      </div>

      {preview.suggestedShare !== null && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Lightbulb} />
          <Alert.Content>
            <Alert.Title>
              Você quis dizer {percentText(share ?? 0)}% do pedido para o
              vendedor?
            </Alert.Title>
            <Alert.Description>
              Então o número aqui é <b>{percentText(preview.suggestedShare)}</b>{" "}
              — este campo é a fatia <b>da comissão</b>, não do pedido. Do jeito
              que está, o vendedor recebe {formatMoney(preview.sellerAmount)}{" "}
              num pedido de {formatMoney(preview.orderAmount)}.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
