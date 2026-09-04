/**
 * As explicações das colunas da análise por produto.
 *
 * São strings porque cada texto vai no `title` do `<th>`: cabeçalho ordenável
 * já é um `<button>`, e um botão de ajuda dentro dele seria HTML inválido
 * (mesma razão de `clients/help.tsx`).
 *
 * Aqui a explicação não é enfeite: a tela afirma coisas fortes ("parou de
 * comprar") a partir de uma conta que o vendedor não vê. Sem dizer de onde sai
 * o número, a primeira divergência com a memória dele derruba a confiança na
 * aba inteira.
 */
export const PRODUCT_COLUMN_HELP: Record<string, string> = {
  product:
    "Produtos que este cliente já comprou, com o código de cada um. Só entram pedidos fechados — orçamento e pedido cancelado não contam.",
  factory:
    "De qual fábrica o produto é. O ritmo de compra é contado por fábrica: o mesmo produto em duas fábricas tem duas histórias.",
  presence:
    'Em quantos pedidos daquela fábrica este produto apareceu. "8 de 10" quer dizer que ele entra em quase todo pedido — é um item fixo do cliente.',
  lastPurchase: "Data do último pedido em que este produto foi comprado.",
  cycle:
    "De quanto em quanto tempo este cliente costuma comprar este produto, pela média dos intervalos entre as compras dele. Precisa de pelo menos duas compras.",
  expected:
    "Quando a próxima compra era esperada: a última compra mais o ritmo de compra. É uma estimativa, não um compromisso.",
  amount:
    "Quanto ele levou na última compra e a média das compras, em unidades.",
  status:
    "A leitura do sistema: em dia, na hora de repor, atrasado, parou de comprar, ou comprou uma única vez. O prazo de referência é o ritmo DESTE cliente.",
};
