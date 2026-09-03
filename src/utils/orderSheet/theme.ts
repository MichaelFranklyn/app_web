/**
 * A cara da ficha — as cores do sistema, traduzidas para o Excel.
 *
 * Ela é aberta na frente do cliente, num notebook em cima do balcão, e depois
 * impressa para ele levar. Então o desenho responde a duas exigências ao mesmo
 * tempo: hierarquia para quem preenche (o que é campo tem de saltar) e
 * sobriedade para quem recebe (na folha impressa, a ficha é um documento).
 *
 * Os valores saem de `src/styles/globals.css`, com duas conversões:
 *
 * 1. **ARGB** — é como o Excel guarda cor: `FF` de opacidade + o hexadecimal.
 * 2. **Sem transparência** — os tokens `--*-bg` do sistema são rgba sobre o
 *    fundo da tela. O Excel não compõe camadas de forma confiável entre Excel,
 *    LibreOffice e Sheets, então cada um deles vira aqui a cor JÁ ACHATADA
 *    sobre o branco do papel.
 */

/** ARGB, como o Excel guarda. */
export const COLOR = {
  /** --text */
  ink: "FF1A1A16",
  /** --text2 */
  ink2: "FF3D3D36",
  /** --muted */
  muted: "FF7A7A6E",
  /** --border */
  line: "FFE2E1D8",
  /** --border2 */
  line2: "FFCCCBC0",

  /** --amber: a cor da interação. Na ficha, é o que o vendedor preenche. */
  amber: "FFC97F0A",
  /** --amber2 */
  amber2: "FFA86608",
  /** --amber-bg2 (13%) achatado sobre o branco: o fundo dos campos. */
  amberBg: "FFF8EEDF",
  /** --amber-bd (28%) achatado sobre o branco: a borda dos campos. */
  amberBd: "FFF0DBBA",

  /** --mod-orders: a ficha é um documento do módulo de pedidos. */
  module: "FFA08010",
  /** O mesmo tom a 10%, achatado — a faixa dos títulos de bloco. */
  moduleBg: "FFF6F2E7",

  /** --bg */
  paper: "FFF5F4F0",
  /** --bg3 */
  paper2: "FFF0EFE9",
  /** Entre o branco e o --bg: a zebra da tabela, quase imperceptível. */
  zebra: "FFFAF9F6",
  white: "FFFFFFFF",
} as const;

/**
 * Calibri, e não a fonte do sistema.
 *
 * Oswald e Nunito são carregadas pelo navegador; o Excel do balcão não as tem
 * instaladas e substituiria por conta própria, sem avisar. Calibri existe em
 * toda instalação e o LibreOffice tem métrica equivalente.
 */
export const FONT = "Calibri";

export const fill = (argb: string) =>
  ({ type: "pattern", pattern: "solid", fgColor: { argb } }) as const;

export const thin = (argb: string = COLOR.line) =>
  ({ style: "thin", color: { argb } }) as const;

export const medium = (argb: string) =>
  ({ style: "medium", color: { argb } }) as const;

/** Moeda com duas casas — o que o cliente ouve. */
export const MONEY_FORMAT = "#,##0.00";
/** Percentual digitado como número (12 = 12%), não como fração. */
export const PERCENT_FORMAT = "0.##";
