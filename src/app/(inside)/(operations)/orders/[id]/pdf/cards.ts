import { clientName, factoryName } from "@/utils/company";
import { maskCNPJ } from "@/utils/format/masks";
import { OrderDetail } from "../interface";
import { PartyCard } from "./parties";

/**
 * Dados das duas partes do negócio, para os cartões do topo. Linhas vazias são
 * descartadas: um cartão com "CNPJ —" ou uma linha em branco no meio parece
 * documento defeituoso para quem recebe.
 *
 * A condição de pagamento vem junto de vendedor e frete (mesma família de
 * "termos do negócio"), na mesma fonte das demais linhas do cartão.
 */
export const factoryCard = (
  order: OrderDetail,
  paymentTermLabel?: string | null
): PartyCard => ({
  title: "Fábrica",
  lines: [
    factoryName(order.factory),
    order.seller?.name ? `Vendedor: ${order.seller.name}` : "",
    order.freightType ? `Frete: ${order.freightType}` : "",
    paymentTermLabel ? `Pagamento: ${paymentTermLabel}` : "",
  ].filter(Boolean),
});

export const clientCard = (order: OrderDetail): PartyCard => {
  const client = order.client;
  const city = [client?.addressCity, client?.addressState]
    .filter(Boolean)
    .join(" / ");

  return {
    title: "Cliente",
    lines: [
      clientName(client),
      client?.cnpj ? `CNPJ ${maskCNPJ(client.cnpj)}` : "",
      city,
    ].filter(Boolean),
  };
};
