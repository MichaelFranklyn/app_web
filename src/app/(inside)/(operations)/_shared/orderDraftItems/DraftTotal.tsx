"use client";

import { AlertTriangle, Truck } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";

import { FreeFreightTarget } from "../orderFreight";
import { PaymentTermMinimum } from "./interface";

interface Props {
  /** Mercadoria acumulada no rascunho, sem IPI — a base que o piso cobra. */
  total: number;
  minimum?: PaymentTermMinimum | null;
  /**
   * Piso de frete grátis da modalidade escolhida. Diferente do piso da condição
   * de pagamento: este NUNCA barra nada — é alavanca de venda, não exigência.
   */
  freeFreight?: FreeFreightTarget | null;
}

/**
 * Total do rascunho e, quando a condição de pagamento tem piso, quanto falta
 * para alcançá-lo.
 *
 * O aviso aparece aqui, enquanto o vendedor ainda está montando o pedido, e não
 * como recusa no fim: o rascunho abaixo do piso é salvo normalmente, e só a
 * confirmação — já com pedido e itens gravados — é que barra.
 */
export function DraftTotal({ total, minimum, freeFreight }: Props) {
  const missing = minimum ? minimum.amount - total : 0;
  const isBelow = missing > 0;

  // Quanto falta para o frete sair de graça NESTA modalidade. Alcançado o piso,
  // o aviso vira confirmação — e some do caminho quando não há piso nenhum.
  const freightMissing = freeFreight ? freeFreight.amount - total : 0;
  const hasFreeFreight = Boolean(freeFreight) && freightMissing <= 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-16">
        <Title variant="label" weight="bold" className="tracking-normal">
          Total do pedido
        </Title>
        <Title variant="value" weight="bold">
          {formatMoney(total)}
        </Title>
      </div>

      {minimum && !isBelow && (
        <Title variant="caption" color="muted">
          A condição {minimum.termName} pede no mínimo{" "}
          {formatMoney(minimum.amount)} — este pedido já alcança.
        </Title>
      )}

      {isBelow && minimum && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={AlertTriangle} />
          <Alert.Content>
            <Alert.Title>
              Faltam {formatMoney(missing)} para a condição {minimum.termName}
            </Alert.Title>
            <Alert.Description>
              A fábrica pede no mínimo {formatMoney(minimum.amount)} neste
              prazo. Você pode continuar e salvar o pedido do jeito que está —
              ele fica como rascunho —, mas para confirmá-lo é preciso incluir
              mais itens ou escolher outra condição de pagamento.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Frete grátis é oportunidade, não exigência: entra como `info` (nunca
          `warning`) e a frase nomeia a modalidade — o piso é DELA, e quem monta
          um pedido FOB não pode perseguir o valor que libera a entrega CIF. */}
      {freeFreight && !hasFreeFreight && (
        <Alert.Root variant="info">
          <Alert.Icon icon={Truck} />
          <Alert.Content>
            <Alert.Title>
              Faltam {formatMoney(freightMissing)} para o frete grátis em{" "}
              {freeFreight.freightType}
            </Alert.Title>
            <Alert.Description>
              Esta fábrica não cobra frete em {freeFreight.freightType} a partir
              de {formatMoney(freeFreight.amount)}. Adicione mais itens para o
              cliente ganhar o frete desta modalidade — o pedido pode ser
              fechado do jeito que está, isso não impede nada.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {hasFreeFreight && freeFreight && (
        <Title variant="caption" color="muted">
          Este pedido já tem frete grátis em {freeFreight.freightType} (a partir
          de {formatMoney(freeFreight.amount)}).
        </Title>
      )}
    </div>
  );
}
