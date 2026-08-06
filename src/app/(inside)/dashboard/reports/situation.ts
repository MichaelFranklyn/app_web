import {
  SERIES_BLUE,
  SERIES_GREEN,
  SERIES_ORANGE,
  SERIES_RED,
} from "@/components/Chart/chartTheme";

/**
 * O vocabulário da situação de compra — o enum `ClientWalletSituation` do
 * schema e como ele se escreve na tela.
 *
 * Mora no pai porque duas abas-irmãs medem a MESMA régua em recortes
 * diferentes: a carteira mede o cliente contra o próprio ritmo, e as últimas
 * compras medem o par cliente×fábrica contra o ritmo daquela fábrica. Se cada
 * aba tivesse a própria tradução, "Parado" numa seria "Inativo" na outra e o
 * vermelho de uma virava o cinza da outra.
 */
export type ClientSituation =
  | "ACTIVE"
  | "AT_RISK"
  | "INACTIVE"
  | "NEW"
  | "NEVER";

/**
 * Rótulo em linguagem de quem atende a carteira — "parado" diz mais do que
 * "inativo" para quem vai ligar para o cliente.
 */
export const SITUATION_LABEL: Record<ClientSituation, string> = {
  ACTIVE: "Em dia",
  AT_RISK: "Atrasado",
  INACTIVE: "Parado",
  NEW: "Novo",
  NEVER: "Nunca comprou",
};

/** O que cada situação significa, para o tooltip e o cabeçalho da coluna. */
export const SITUATION_HINT: Record<ClientSituation, string> = {
  ACTIVE: "comprou dentro do próprio ritmo",
  AT_RISK: "passou do intervalo que costuma levar",
  INACTIVE: "passou do dobro do próprio intervalo",
  NEW: "primeira compra, há menos de 90 dias",
  NEVER: "está na carteira e nunca comprou",
};

export const SITUATION_COLOR: Record<
  ClientSituation,
  "green" | "red" | "blue" | "neutral" | "subtle"
> = {
  ACTIVE: "green",
  AT_RISK: "red",
  INACTIVE: "neutral",
  NEW: "blue",
  NEVER: "subtle",
};

/** A mesma leitura de cor nos gráficos, onde o token de badge não chega. */
export const SITUATION_SERIES_COLOR: Record<ClientSituation, string> = {
  ACTIVE: SERIES_GREEN,
  AT_RISK: SERIES_RED,
  INACTIVE: SERIES_ORANGE,
  NEW: SERIES_BLUE,
  NEVER: "#9a9a8e",
};

/**
 * A ordem em que as situações se leem: do saudável ao perdido.
 *
 * É a ordem das barras do gráfico e das visões acima da tabela — as duas contam
 * a mesma história da esquerda para a direita.
 */
export const SITUATION_ORDER: ClientSituation[] = [
  "ACTIVE",
  "AT_RISK",
  "INACTIVE",
  "NEW",
  "NEVER",
];
