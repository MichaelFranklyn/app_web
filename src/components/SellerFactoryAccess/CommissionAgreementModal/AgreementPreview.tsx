"use client";

import { Alert } from "@/components/Alert";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { TriangleAlert } from "lucide-react";

import { agreementPreview, percentText } from "../utils";

interface Props {
  /** O que está digitado no campo; `null` = em branco (comissão inteira). */
  rate: number | null;
  /** A comissão que a fábrica paga à empresa, em %. */
  factoryRate: number;
}

/** Uma linha do quadro: quem, quanto, e por quê. */
function Row({
  label,
  value,
  strong,
  negative,
}: {
  label: string;
  value: string;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-12">
      <Title variant="body-sm" color="muted">
        {label}
      </Title>
      <Title
        variant="body-sm"
        weight={strong ? "bold" : "semibold"}
        color={negative ? "red" : undefined}
      >
        {value}
      </Title>
    </div>
  );
}

/**
 * O acordo traduzido em dinheiro, num pedido de R$ 10.000.
 *
 * O campo pede um percentual, e percentual sozinho não se confere: "3%" e "30%"
 * ocupam o mesmo espaço na tela. Ninguém combina R$ 3.000 de comissão com um
 * vendedor num pedido de dez mil e acha que está certo — o número em reais é o
 * que faz o engano aparecer antes de virar repasse.
 *
 * A linha do escritório fica NEGATIVA quando o acordo passa do que a fábrica
 * paga. Não é bloqueio: pode ser um acerto real (fábrica que baixou a taxa, um
 * pedido puxado a fórceps), e a decisão continua sendo do escritório.
 */
export function AgreementPreview({ rate, factoryRate }: Props) {
  // Sem a taxa da fábrica não há o que comparar: o quadro inteiro sai.
  if (!factoryRate) return null;

  const preview = agreementPreview(rate, factoryRate);
  const isOverFactory = preview.officeAmount < 0;

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
            rate === null
              ? "O vendedor recebe (comissão inteira)"
              : `O vendedor recebe (${percentText(rate)}% do pedido)`
          }
          value={formatMoney(preview.sellerAmount)}
          strong
        />
        <Row
          label="Fica no escritório"
          value={formatMoney(preview.officeAmount)}
          negative={isOverFactory}
        />
      </div>

      {isOverFactory && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={TriangleAlert} />
          <Alert.Content>
            <Alert.Title>
              O vendedor ganha mais do que a fábrica paga
            </Alert.Title>
            <Alert.Description>
              A fábrica paga {percentText(factoryRate)}% e o acordo é de{" "}
              {percentText(rate ?? 0)}%: o escritório tira{" "}
              {formatMoney(Math.abs(preview.officeAmount))} do próprio bolso a
              cada {formatMoney(preview.orderAmount)} vendidos. Dá para salvar
              assim, se for esse o combinado.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
