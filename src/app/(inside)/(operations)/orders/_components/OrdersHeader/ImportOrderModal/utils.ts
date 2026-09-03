import { maskCNPJ } from "@/utils/format/masks";
import type { OrderSheetRead } from "@/utils/orderSheet/read";

import { clientOptionLabel } from "../../../../_shared/clientOption";
import type { CreateOrderInput } from "../interface";

/**
 * Como chamar o cliente da ficha enquanto a carteira não carregou.
 *
 * O select precisa de um texto para mostrar. O ideal é o rótulo da própria
 * opção (o wizard usa quando ela já está na lista); aqui é o plano B, montado
 * com o mesmo formato — nome e CNPJ — para o campo não mudar de cara quando a
 * lista chega.
 *
 * Razão social e fantasia são FÓRMULA na ficha: numa planilha que nunca foi
 * recalculada elas chegam vazias, e aí o CNPJ digitado é o que sobra. É pouco,
 * mas é o suficiente para o vendedor reconhecer quem está no campo.
 */
export const clientLabelFromSheet = (sheet: OrderSheetRead): string => {
  const name = sheet.nomeFantasia || sheet.razaoSocial;
  if (!name) return sheet.cnpjDigits ? maskCNPJ(sheet.cnpjDigits) : "";
  return clientOptionLabel({
    razaoSocial: sheet.razaoSocial,
    nomeFantasia: sheet.nomeFantasia || null,
    cnpj: sheet.cnpjDigits,
  });
};

/**
 * Os dois caminhos de importação.
 *
 * "sheet" é a ficha do sistema: ela se lê sozinha e não pergunta nada. "file" é
 * o arquivo da fábrica (PDF ou Excel), que não sabe de quem é o pedido — daí o
 * formulário antes.
 */
export type ImportMode = "sheet" | "file";

/** Só o que o pedido aceita como frete; o resto da célula é lixo digitado. */
const freightOf = (raw: string): string | null =>
  raw === "CIF" || raw === "FOB" ? raw : null;

/**
 * O pedido que a ficha descreve.
 *
 * A ficha do sistema já traz tudo o que o formulário perguntaria — quem a
 * preencheu escolheu o cliente, a fábrica, o prazo e o frete lá, na loja. Então
 * ela não passa pelos campos: vira input direto, e o vendedor confere os itens,
 * que é onde o catálogo do dia pode discordar do que ele anotou.
 *
 * `paymentTermId` chega de fora porque a ficha guarda o NOME da condição e o id
 * só existe depois que as condições da fábrica voltam do servidor.
 */
export const sheetToOrderInput = (
  sheet: OrderSheetRead,
  paymentTermId: string | null,
  orderDate: string
): CreateOrderInput => ({
  sellerId: sheet.meta.sellerId,
  clientId: sheet.clientId ?? "",
  factoryId: sheet.factoryId ?? "",
  orderDate,
  paymentTermId,
  freightType: freightOf(sheet.freightType),
  notes: sheet.notes || null,
  deliveryEstimateDays: sheet.deliveryEstimateDays,
  coverageDays: sheet.coverageDays,
  isQuote: false,
});

/**
 * O que a ficha disse, numa linha.
 *
 * Como os campos não aparecem, é este resumo que mostra ao vendedor o que o
 * sistema entendeu antes de ele confirmar — inclusive a condição que NÃO foi
 * encontrada, que é o único dado da ficha que pode se perder no caminho (a
 * fábrica pode ter renomeado a condição depois que a ficha foi baixada).
 */
export const sheetSummary = (
  sheet: OrderSheetRead,
  termLabel: string | null
): string =>
  [
    clientLabelFromSheet(sheet),
    sheet.factoryName,
    termLabel ??
      (sheet.paymentTermName
        ? `condição "${sheet.paymentTermName}" não existe mais nesta fábrica`
        : null),
    sheet.freightType ? `frete ${sheet.freightType}` : null,
    `${sheet.items.length} item(ns)`,
  ]
    .filter(Boolean)
    .join("  ·  ");
