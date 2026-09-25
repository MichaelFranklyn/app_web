import { NewOrderOrigin } from "./interface";

export interface BackLink {
  href: string;
  label: string;
}

interface Params {
  clientId?: string;
  factoryId?: string;
  visitItemId?: string;
  sellerId?: string;
}

/**
 * A origem vem na URL (contrato em `@/utils/newOrderUrl`): `?visitItemId=` com
 * o vínculo inteiro (visita), `?clientId=` (tela do cliente) ou `?factoryId=`
 * (tela da fábrica). Sem nada, é o pedido aberto da lista.
 */
export const resolveOrigin = ({
  clientId,
  factoryId,
  visitItemId,
  sellerId,
}: Params): NewOrderOrigin => {
  // Da visita só vale com o vínculo completo; faltando parte, cai para a porta
  // que o que veio consegue abrir — melhor que um pedido sem dono.
  if (visitItemId && sellerId && clientId && factoryId) {
    return { kind: "visit", visitItemId, sellerId, clientId, factoryId };
  }
  if (clientId) return { kind: "client", clientId };
  if (factoryId) return { kind: "factory", factoryId };
  return { kind: "orders" };
};

const BACK_LABEL: Record<NewOrderOrigin["kind"], string> = {
  orders: "Pedidos",
  client: "Cliente",
  factory: "Fábrica",
  visit: "Visita",
};

/**
 * Para onde "Cancelar" e o caminho do topo levam: a tela de onde o pedido foi
 * aberto. Só aceita caminho interno — `from` chega pela URL, e um `//outro.site`
 * viraria um link para fora do sistema.
 */
export const resolveBackLink = (
  origin: NewOrderOrigin,
  from: string | undefined
): BackLink => {
  const isInternal = !!from && from.startsWith("/") && !from.startsWith("//");
  const href = origin.kind !== "orders" && isInternal ? from : "/orders";
  return {
    href,
    label: href === "/orders" ? BACK_LABEL.orders : BACK_LABEL[origin.kind],
  };
};
