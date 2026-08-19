import { ReactNode } from "react";

/**
 * As explicações da área de pedidos, num lugar só — lista e detalhe.
 *
 * O pedido é onde o vocabulário do sistema mais aperta: "valor" e "total" não
 * são a mesma coisa (um é a mercadoria, o outro tem IPI e imposto embutido),
 * "faturado" não é "entregue" e "comissão" só nasce depois da nota. Cada texto
 * abaixo responde uma pergunta que a tela levanta sozinha.
 *
 * As colunas de tabela guardam STRING porque a explicação vai no `title` do
 * `<th>`: cabeçalho ordenável já é um `<button>`, e um botão de ajuda dentro
 * dele seria HTML inválido. O resto é ReactNode, para o HelpTooltip.
 */

// ── Lista de pedidos ─────────────────────────────────────────────────────────

export const ORDER_KPI_HELP: Record<string, ReactNode> = {
  Pedidos: (
    <>
      <p>
        Quantos <b>pedidos feitos</b> há no recorte da tela: confirmados,
        faturados e entregues.
      </p>
      <p>
        Orçamento e cancelado não entram nestes quatro cartões — eles aparecem
        na lista abaixo, mas não são venda. Se você filtrar por uma dessas
        situações, os cartões passam a contá-la.
      </p>
    </>
  ),
  "Valor total": (
    <>
      <p>
        Soma da <b>mercadoria</b> dos pedidos feitos: sem IPI e sem frete. É a
        mesma base sobre a qual a fábrica calcula a comissão.
      </p>
      <p>
        No detalhe de um pedido, o &quot;Total do pedido&quot; é maior: lá entra
        o que o cliente paga de verdade, com IPI e imposto embutido.
      </p>
    </>
  ),
  Faturado: (
    <p>
      Quanto, dos pedidos feitos deste recorte, a fábrica já faturou (emitiu
      nota). É o marco que libera a comissão — pedido ainda não faturado não
      conta aqui.
    </p>
  ),
  "Comissão do faturado": (
    <p>
      Comissão gerada pelos pedidos já faturados deste recorte. Quando ela cai
      no seu bolso é outra conta, que depende do prazo da fábrica — veja a tela
      de Comissões.
    </p>
  ),
};

export const ORDER_TAB_HELP: Record<"all" | "pending", string> = {
  all: "Todos os pedidos da empresa, em qualquer situação: orçamentos, confirmados, faturados, entregues e cancelados.",
  pending:
    "Só os pedidos confirmados que a fábrica ainda não faturou — a fila de cobrança da nota. Orçamento não entra: ele ainda não é pedido.",
};

/** Explicação de cada coluna da lista (vai no `title` do cabeçalho). */
export const ORDER_COLUMN_HELP = {
  code: "Código curto do pedido — os 8 primeiros caracteres do identificador. É por ele que o pedido é procurado no filtro e o que sai impresso no PDF.",
  sortHint:
    "Cliente, fábrica e vendedor ordenam pelo nome que você vê na coluna.",
  client:
    "Cliente que fez a compra. A tarja vermelha avisa que a entrega passou da data prevista e ainda não foi confirmada.",
  factory: "Fábrica de quem a mercadoria foi comprada.",
  seller: "Vendedor responsável pelo pedido — quem ganha a comissão dele.",
  date: "Dia em que a compra foi feita. Não é a data da nota: essa fica no filtro “Data de faturamento” e no detalhe do pedido.",
  status:
    "Onde o pedido está: Orçamento (ainda não vale), Confirmado (fechado com o cliente), Faturado (a fábrica emitiu a nota), Entregue (chegou na loja) ou Cancelado.",
  amount:
    "Valor da mercadoria, sem IPI e sem imposto embutido — a base sobre a qual a fábrica calcula a comissão. No detalhe do pedido, o “Total do pedido” soma o IPI e o imposto e por isso é maior: é o que o cliente paga.",
  commission:
    "Comissão que este pedido gera para a representação. Só é calculada no faturamento: pedido não faturado aparece zerado.",
} as const;

// ── Detalhe do pedido ────────────────────────────────────────────────────────

/** Colunas da tabela de itens (vai no `title` do cabeçalho). */
export const ITEM_COLUMN_HELP = {
  product:
    "Produto comprado, com o código (SKU) que a fábrica usa na tabela dela.",
  tier: "Tabela de preço aplicada a esta linha — o nível acordado com o cliente. Item digitado com preço à mão fica sem tabela.",
  units:
    "Quantidade em UNIDADES (peças), não em caixas. O preço da tabela é por embalagem; o pedido conta peça.",
  unitPrice:
    "Preço de tabela da peça, sem os impostos embutidos. É o número que aparece na tabela de preços da fábrica.",
  unitPriceWithTax:
    "O que a peça custa ao cliente com o imposto embutido (ST, por exemplo) já somado.",
  discount: "Desconto concedido nesta linha, em dinheiro.",
  ipiRate:
    "Alíquota de IPI do produto e quanto ela dá em dinheiro nesta linha. O IPI é cobrado FORA do preço e some do subtotal, mas entra no total do pedido.",
  tax: "Impostos embutidos no preço (ST e afins), com as alíquotas do produto e o valor que elas somam nesta linha.",
  subtotal:
    "Quanto esta linha soma: quantidade × preço, menos o desconto, com o imposto embutido. O IPI, quando existe, é somado à parte no resumo.",
  actions:
    "Editar a quantidade, o preço e o desconto do item, ou removê-lo do pedido.",
} as const;

/** Colunas da tabela de parcelas (vai no `title` do cabeçalho). */
export const INSTALLMENT_COLUMN_HELP = {
  sequence: "Ordem da parcela dentro do prazo combinado: 1 de 3, 2 de 3…",
  dueDate:
    "Vencimento do boleto do cliente. De onde contam os dias (da nota ou da compra) está escrito na tarja acima da tabela.",
  amount: "Valor do boleto que o cliente paga nesta parcela.",
  commission:
    "Fatia da comissão que esta parcela gera. Quando ela pode ser cobrada da fábrica depende do modo de comissão, explicado no “?” do título.",
  status:
    "Situação do boleto: pendente, pago, cancelado ou inadimplente (o cliente não pagou).",
  actions:
    "Registrar o pagamento do boleto, marcar que o cliente não pagou ou desfazer um lançamento errado.",
} as const;

/** Resumo financeiro do pedido, linha a linha. */
export const SUMMARY_HELP: Record<string, ReactNode> = {
  subtotal: (
    <p>
      Soma dos itens com o imposto embutido, <b>sem</b> o IPI. É esta a base
      sobre a qual a fábrica calcula a comissão.
    </p>
  ),
  ipi: (
    <p>
      IPI somado dos itens. Ele é cobrado por fora do preço: entra no total que
      o cliente paga, mas não na base da comissão.
    </p>
  ),
  total: (
    <p>
      O que o cliente paga por este pedido: os itens mais o IPI. Na lista de
      pedidos, a coluna &quot;Valor&quot; mostra só a mercadoria e por isso é
      menor.
    </p>
  ),
  commission: (
    <p>
      Comissão da representação neste pedido. Ela só é calculada no faturamento
      — antes disso aparece zerada.
    </p>
  ),
  paymentTerm: (
    <p>
      Prazo combinado com o cliente: é ele que gera os boletos no faturamento
      (30/60/90 = três parcelas). Algumas fábricas exigem um valor mínimo por
      prazo.
    </p>
  ),
  freight: (
    <p>
      Quem paga o transporte. <b>FOB</b>: por conta do cliente. <b>CIF</b>: a
      fábrica entrega. Algumas fábricas dão frete grátis acima de um valor.
    </p>
  ),
};
