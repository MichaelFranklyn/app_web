import { useMemo } from "react";

import { useCompanyFactoryNode } from "../orderItemCatalog";
import { FreeFreightTarget } from "./interface";

/**
 * O piso de frete grátis que vale para o pedido que está sendo montado.
 *
 * O piso é POR MODALIDADE: em CIF a fábrica isenta a própria entrega, em FOB ela
 * banca (ou não) o transporte que o cliente contratou, e os valores costumam ser
 * diferentes. Por isso o alvo só existe depois que a modalidade foi escolhida —
 * mostrar "faltam R$ 800 para o frete grátis" sem dizer de qual frete faz o
 * vendedor acrescentar itens mirando um benefício que o pedido dele não terá.
 *
 * Reaproveita a consulta que o wizard já faz para resolver o vínculo da fábrica
 * (`useCompanyFactoryNode`) — nenhuma requisição a mais.
 */
/** Piso cadastrado no vínculo, na forma em que a query o devolve. */
export interface FreeFreightAmounts {
  freeFreightCifAmount: number | null;
}

/**
 * O piso que vale para o pedido — puro, para a regra ser testável sem Apollo.
 *
 * Só CIF tem alvo: frete grátis é a fábrica deixando de cobrar a ENTREGA, e em
 * FOB quem contrata o transporte é o cliente, então não há o que isentar. Também
 * devolve `null` enquanto a modalidade não foi escolhida e quando a fábrica não
 * oferece. Zero e nulo significam a mesma coisa em toda a cadeia ("não
 * oferece"), como no `shortfall` do backend.
 */
export const pickFreeFreight = (
  amounts: FreeFreightAmounts | null,
  freightType: string | null | undefined
): FreeFreightTarget | null => {
  if (!amounts || !freightType) return null;
  const type = freightType.toUpperCase();
  if (type !== "CIF") return null;
  const amount = amounts.freeFreightCifAmount;
  if (!amount || amount <= 0) return null;
  return { freightType: type, amount };
};

export function useFreeFreightTarget(
  open: boolean,
  factoryId: string | null,
  freightType: string | null | undefined
): FreeFreightTarget | null {
  const node = useCompanyFactoryNode(open, factoryId);

  return useMemo(() => pickFreeFreight(node, freightType), [node, freightType]);
}
