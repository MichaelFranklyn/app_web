/**
 * Onde cada coisa fica na ficha.
 *
 * As fórmulas apontam para células por endereço absoluto ("$B$4"), e o
 * importador vai ler as mesmas posições. Um número solto no meio de uma fórmula
 * é indecifrável seis meses depois — e mover uma linha da folha sem mover a
 * leitura quebra a importação em silêncio. Por isso todas as posições moram
 * aqui, e tanto a geração quanto a leitura partem deste arquivo.
 */

/** Aba visível: a folha que o vendedor preenche. */
export const FORM_SHEET = "FICHA DE PEDIDO";

/** Abas ocultas: as listas que as fórmulas consultam. */
export const CATALOG_SHEET = "CATALOGO";
export const CLIENTS_SHEET = "CLIENTES";
export const LINKS_SHEET = "VINCULOS";
export const FACTORIES_SHEET = "FABRICAS";
export const META_SHEET = "_META";

/**
 * Linhas do cabeçalho da folha (1-based, como o Excel conta).
 *
 * O cabeçalho é um bloco de duas colunas: o CLIENTE à esquerda e as CONDIÇÕES
 * do pedido à direita, na mesma altura. Por isso os dois lados repetem os
 * mesmos números de linha.
 */
export const HEAD = {
  logos: 1,
  /** Filete da cor do módulo: o que vem abaixo dele é o documento. */
  rule: 2,
  title: 3,
  identity: 4,
  sectionTitle: 6,

  // Coluna da esquerda: quem é o cliente. Nenhuma instrução de preenchimento
  // mora aqui: o cabeçalho impresso é do cliente, e o manual da folha ficou na
  // coluna de extras (`EXTRA`), que não sai no papel.
  cnpj: 7,
  razaoSocial: 8,
  fantasia: 9,
  address: 10,
  cityState: 11,

  // Coluna da direita: como o pedido foi combinado. O nível acordado NÃO está
  // aqui — ele é combinação entre a representação e a fábrica, e a ficha é
  // entregue ao cliente. Ele mora na zona do vendedor (`SELLER_TIER_ROW`).
  factory: 7,
  paymentTerm: 8,
  freight: 9,
  deliveryDays: 10,
  coverageDays: 11,
} as const;

/**
 * Colunas do cabeçalho: rótulo e valor de cada lado.
 *
 * O rótulo ocupa duas colunas e o valor três — as dez colunas da tabela de
 * itens são estreitas demais para um rótulo caber sozinho em qualquer uma
 * delas. A leitura de volta não depende disso (ela procura o texto do rótulo e
 * pega o primeiro valor à direita), mas as FÓRMULAS apontam para cá.
 */
export const HEAD_COL = {
  leftLabel: "A",
  leftLabelEnd: "B",
  leftValue: "C",
  leftValueEnd: "E",
  rightLabel: "F",
  rightLabelEnd: "G",
  rightValue: "H",
  rightValueEnd: "J",
} as const;

/** A tabela de itens: cabeçalho, primeira linha preenchível e quantas linhas. */
export const ITEMS = {
  header: 15,
  first: 16,
  count: 40,
} as const;

export const ITEMS_LAST = ITEMS.first + ITEMS.count - 1;
export const TOTAL_ROW = ITEMS_LAST + 1;

/**
 * As duas linhas de rodapé, separadas POR PÚBLICO.
 *
 * A ficha é impressa e entregue ao cliente — o vendedor faz isso o tempo todo.
 * Então a validade dos preços, que interessa a quem recebe, fica dentro da área
 * de impressão; o recado de operação ("peça uma ficha nova quando a tabela
 * mudar") fica abaixo dela, FORA da área, e só existe na tela.
 */
export const CLIENT_NOTE_ROW = TOTAL_ROW + 2;

/**
 * O que entra no papel: da marca até o aviso de validade.
 *
 * O `$` nas LINHAS não é enfeite. O ExcelJS monta o `_xlnm.Print_Area`
 * concatenando um `$` na frente de cada ponta do intervalo — dar "A1:J58" a ele
 * produz `$A1:$J58`, com a coluna absoluta e a linha relativa. O Excel tolera;
 * o LibreOffice ignora a área e imprime a folha inteira, inclusive o recado que
 * era só do vendedor. Escrito assim, o que sai no arquivo é `$A$1:$J$58`.
 */
export const PRINT_AREA = `A$1:J$${CLIENT_NOTE_ROW}`;

/**
 * A coluna de informações extras — à DIREITA da área de impressão.
 *
 * A ficha é entregue ao cliente, e nem tudo o que ela precisa saber é para ele
 * ver: o nível acordado é o desconto negociado com a fábrica, e as observações
 * são anotação de quem vende. Como a área de impressão termina na coluna J,
 * tudo o que mora daqui para a direita existe na tela e some no papel — sem
 * depender de o vendedor lembrar de esconder nada.
 *
 * É um bloco para crescer: cada campo novo é uma linha a mais em `EXTRA`.
 */
export const EXTRA_COL = {
  label: "L",
  labelEnd: "M",
  value: "N",
  valueEnd: "Q",
} as const;

export const EXTRA = {
  /** Na mesma altura das faixas do cabeçalho, para os três blocos se alinharem. */
  title: HEAD.sectionTitle,
  /** O que está faltando agora — muda conforme a ficha é preenchida. */
  warning: HEAD.sectionTitle + 1,
  tier: HEAD.sectionTitle + 2,
  notes: HEAD.sectionTitle + 3,
  /** A caixa de observações ocupa três linhas — é onde se escreve frase. */
  notesEnd: HEAD.sectionTitle + 5,
  /** O manual da folha: fixo, e por isso mesmo fora do papel. */
  howTo: HEAD.sectionTitle + 6,
  howToEnd: HEAD.sectionTitle + 8,
} as const;

/** Colunas da tabela de itens, na ordem em que aparecem. */
export const COL = {
  sku: "A",
  description: "B",
  pack: "C",
  multiple: "D",
  packQty: "E",
  unitsTotal: "F",
  packPrice: "G",
  discount: "H",
  taxes: "I",
  total: "J",
} as const;

/** Colunas fixas do CATALOGO (as de preço vêm depois, uma por nível). */
export const CATALOG_COL = {
  key: 1,
  factory: 2,
  sku: 3,
  name: 4,
  pack: 5,
  unitsPerPack: 6,
  multiple: 7,
  taxes: 8,
  ncm: 9,
} as const;

/** Primeira coluna de preço no CATALOGO — a partir daqui, um nível por coluna. */
export const CATALOG_FIRST_PRICE_COL = CATALOG_COL.ncm + 1;

/**
 * Colunas do CLIENTES.
 *
 * O `id` fica DEPOIS de `cityState` porque as fórmulas da folha varrem a faixa
 * até ela: acrescentar coluna no fim não mexe em `VLOOKUP` nenhum. Ele existe
 * para a volta — é assim que o importador reconhece o cliente sem ter de casar
 * CNPJ contra o banco.
 */
export const CLIENT_COL = {
  cnpj: 1,
  razaoSocial: 2,
  fantasia: 3,
  address: 4,
  cityState: 5,
  id: 6,
} as const;

/** Colunas do VINCULOS. */
export const LINK_COL = {
  key: 1,
  tier: 2,
} as const;

/** Colunas do FABRICAS (os prazos ocupam da 5ª em diante, uma por prazo). */
export const FACTORY_COL = {
  name: 1,
  id: 2,
  deliveryDays: 3,
  freight: 4,
  firstTerm: 5,
} as const;

/** Converte 1 → "A", 27 → "AA". */
export const columnLetter = (index: number): string => {
  let rest = index;
  let letter = "";
  while (rest > 0) {
    const mod = (rest - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    rest = Math.floor((rest - mod) / 26);
  }
  return letter;
};
