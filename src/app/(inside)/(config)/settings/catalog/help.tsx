/**
 * As explicações dos catálogos da empresa, num lugar só.
 *
 * Cada seção já tem um "?" no título dizendo o que aquele catálogo é — os
 * textos aqui são das COLUNAS, que respondem outra pergunta: o que aquele
 * campo decide lá na frente, quando o cadastro for usado num produto, num
 * cliente ou num preço.
 *
 * São STRING porque a explicação vai no `title` do `<th>`: cabeçalho ordenável
 * já é um `<button>`, e um botão de ajuda dentro dele seria HTML inválido.
 *
 * Mesma organização de `orders/help.tsx`, `clients/help.tsx`,
 * `factories/help.tsx` e `settings/users/help.tsx`.
 */

/** Coluna de ações, igual nas cinco seções. */
const ACTIONS =
  "Renomear ou excluir. Excluir não mexe em quem já usa o cadastro — o que já foi gravado continua como está.";

export const UNIT_COLUMN_HELP = {
  name: "Como o produto é medido e vendido: saco, metro, quilograma, unidade. Cada produto escolhe uma unidade base, e é ela que aparece na quantidade do pedido.",
  actions: ACTIONS,
} as const;

export const LABEL_COLUMN_HELP = {
  name: "Nome da EMBALAGEM em que o produto é vendido: caixa, fardo, pacote. O preço da tabela é por embalagem; o pedido conta peça.",
  actions: ACTIONS,
} as const;

export const CATEGORY_COLUMN_HELP = {
  name: "Como a sua empresa agrupa produtos parecidos, mesmo vindos de fábricas diferentes. É por ela que o catálogo é filtrado.",
  segment:
    "Ramo do PRODUTO a que esta categoria pertence. Não confundir com o segmento do cliente, que é o ramo da loja e mora no catálogo ao lado.",
  actions: ACTIONS,
} as const;

export const SEGMENT_COLUMN_HELP = {
  name: "Ramo de atividade da LOJA: farmácia, mercearia, material de construção. É escolhido na ficha do cliente e filtra a carteira. Não é o CNAE da Receita, que vem de fora e não se edita.",
  actions: ACTIONS,
} as const;

export const TAX_RULE_COLUMN_HELP = {
  name: "Nome da regra de imposto, como a fábrica a chama (ST, por exemplo). A alíquota não fica aqui: ela é definida por produto, na tabela de preços.",
  actions: ACTIONS,
} as const;
