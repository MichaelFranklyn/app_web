/**
 * Negativação de um cliente numa fábrica — a marca, o modal e o texto.
 *
 * Mora em `components` porque as duas pontas do mesmo vínculo a editam: a aba
 * Fábricas do cliente (`(operations)/clients/[id]/factories`) e a aba Clientes
 * da fábrica (`(operations)/factories/[id]/clients`). Quem abre o cliente quer
 * dizer "esta fábrica travou o crédito dele"; quem abre a fábrica quer dizer
 * "esta fábrica travou o crédito destes clientes" — mesmo registro, dois
 * caminhos.
 */
export { ClearNegativeModal } from "./ClearNegativeModal";
export { MarkNegativeModal } from "./MarkNegativeModal";
export { NegativeLinkAction } from "./NegativeLinkAction";
export { NegativeLinkModal } from "./NegativeLinkModal";
export { NegativeTag } from "./NegativeTag";
export type {
  ClientFactoryNegativeState,
  SetClientFactoryNegativeResponse,
} from "./interface";
export {
  daysSince,
  negativeOrderHint,
  negativeSinceLabel,
  negativeTooltip,
} from "./utils";
