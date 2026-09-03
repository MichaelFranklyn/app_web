import { ReactNode } from "react";

/**
 * As explicações da área de fábricas, num lugar só — lista, ficha e abas.
 *
 * A fábrica é onde o sistema guarda o ACORDO (comissão, prazo, contrato) e o
 * CATÁLOGO (produtos, tabelas de preço, níveis). São dois assuntos com
 * vocabulário próprio que se cruzam na mesma tela: "nível" é o desconto
 * acordado com o cliente, "tabela" é a lista de preços onde esse nível vale, e
 * "vínculo" é a fábrica dentro da SUA empresa — não a fábrica no mundo.
 *
 * As colunas de tabela guardam STRING porque a explicação vai no `title` do
 * `<th>`: cabeçalho ordenável já é um `<button>`, e um botão de ajuda dentro
 * dele seria HTML inválido. O resto é ReactNode, para o HelpTooltip.
 *
 * Mesma organização de `orders/help.tsx` e `clients/help.tsx`.
 */

// ── Aba: pedidos desta fábrica ───────────────────────────────────────────────

export const FACTORY_ORDER_COLUMN_HELP = {
  code: "Código curto do pedido — os últimos 6 caracteres do identificador. Clique na linha para abrir o pedido completo.",
  client:
    "Cliente que fez a compra. Ordena pelo nome que você vê na coluna, sobre TODOS os pedidos da fábrica — não só os desta página.",
  seller:
    "Vendedor responsável pelo pedido, e quem ganha a comissão dele. O filtro ao lado lista os vendedores com acesso a esta fábrica, mesmo os que não têm pedido nesta página.",
  date: "Dia em que a compra foi feita. Não é a data da nota — essa fica na ficha do pedido.",
  amount:
    "Valor da mercadoria, sem IPI e sem imposto embutido. É a base sobre a qual a comissão desta fábrica é calculada.",
  commission:
    "Comissão que o pedido gera, pelas condições do vínculo (percentual e base de cálculo da aba Visão geral). Só é calculada no faturamento: pedido não faturado aparece zerado.",
  status:
    "Onde o pedido está: Orçamento, Confirmado, Faturado (a fábrica emitiu a nota), Entregue ou Cancelado.",
  actions: "Editar as observações do pedido ou excluí-lo.",
} as const;

// ── Aba: clientes desta fábrica ──────────────────────────────────────────────

export const FACTORY_CLIENTS_HELP: ReactNode = (
  <>
    <p>
      Os clientes que compram <b>desta fábrica</b>, e por qual vendedor. Cada
      linha é um vínculo — o mesmo cliente pode ser atendido por vendedores
      diferentes em fábricas diferentes.
    </p>
    <p>
      É o vínculo que decide o <b>nível de preço</b> do cliente nesta fábrica e
      o que entra na rota de visita do vendedor.
    </p>
  </>
);

export const FACTORY_CLIENT_COLUMN_HELP = {
  client:
    "Cliente vinculado a esta fábrica. Clique na linha para abrir a ficha dele.",
  seller:
    "Vendedor que atende este cliente NESTA fábrica. Só aparece quem tem acesso ativo à fábrica.",
  priceTier:
    "Nível de preço acordado com o cliente: é ele que decide qual coluna da tabela de preços vale nos pedidos deste cliente. Vínculo sem nível usa o preço padrão da tabela.",
  priority:
    "Peso que este cliente tem na rota de visita desta fábrica. Prioridade alta puxa o cliente para cima no score.",
  lastInvoice:
    "Dia da nota mais recente deste vínculo — deste vendedor, nesta fábrica. Vazio significa que ainda não houve faturamento, mesmo que exista pedido em aberto.",
  actions: "Trocar o nível ou a prioridade do vínculo, ou desfazê-lo.",
} as const;

// ── Aba: vendedores com acesso ───────────────────────────────────────────────

export const FACTORY_SELLERS_HELP: ReactNode = (
  <>
    <p>
      Quem pode vender esta fábrica. Sem acesso aqui, o vendedor não vê a
      fábrica na lista dele e não consegue lançar pedido nem vincular cliente a
      ela.
    </p>
    <p>
      Tirar o acesso não apaga nada do que já foi feito: os pedidos e os
      vínculos antigos continuam onde estão.
    </p>
  </>
);

export const FACTORY_SELLER_COLUMN_HELP = {
  seller: "Vendedor da sua empresa.",
  access:
    "Se o acesso está ligado. Desligado, a fábrica some da lista dele e ele não pode mais lançar pedidos dela.",
  commission:
    "Quanto ESTE vendedor ganha por pedido nesta fábrica, em % do valor do pedido, e quando o escritório repassa. O que sobrar da comissão que a fábrica paga fica no escritório.",
  grantedBy: "Quem concedeu o acesso — fica registrado para conferência.",
  date: "Quando o acesso foi concedido.",
  actions:
    "Ajustar a comissão do vendedor, ligar/desligar o acesso ou removê-lo.",
} as const;

// ── Aba: níveis de preço ─────────────────────────────────────────────────────

export const FACTORY_TIERS_HELP: ReactNode = (
  <>
    <p>
      Nível é o <b>degrau de preço</b> acordado com o cliente — o que a fábrica
      costuma chamar de tabela A, B, C ou de faixa de desconto.
    </p>
    <p>
      Cada tabela de preços tem um preço por nível; o nível do cliente fica no
      vínculo dele (aba Clientes) e é o que o pedido usa sozinho.
    </p>
  </>
);

export const FACTORY_TIER_COLUMN_HELP = {
  tier: "Nome do degrau, como a fábrica o chama. Ele aparece na escolha do nível ao vincular um cliente e ao montar a tabela de preços.",
  actions: "Renomear o nível ou removê-lo.",
} as const;

// ── Aba: condições de pagamento ──────────────────────────────────────────────

export const FACTORY_PAYMENT_TERMS_HELP: ReactNode = (
  <>
    <p>
      Os prazos que esta fábrica aceita. É o prazo escolhido no pedido que gera
      os <b>boletos</b> do cliente no faturamento: 30/60/90 vira três parcelas.
    </p>
    <p>
      Algumas fábricas só liberam o prazo mais longo acima de um valor — é o
      &quot;valor mínimo&quot; da última coluna.
    </p>
  </>
);

export const FACTORY_PAYMENT_TERM_COLUMN_HELP = {
  days: "Em quantos dias cada boleto vence, contados da base que esta fábrica usa (a nota ou o pedido). “30/60/90” são três boletos.",
  installments:
    "Quantos boletos o prazo gera — é a quantidade de vencimentos ao lado.",
  minimum:
    "Valor mínimo do pedido para este prazo ficar disponível. Abaixo dele, o prazo nem aparece na hora de fechar o pedido.",
  actions: "Alterar os vencimentos e o mínimo, ou remover a condição.",
} as const;

// ── Aba: tabelas de preço ────────────────────────────────────────────────────

export const FACTORY_PRICE_LISTS_HELP: ReactNode = (
  <>
    <p>
      Tabela de preços é a lista que a fábrica publica: um preço por produto,
      por <b>nível</b>, valendo num período.
    </p>
    <p>
      Uma fábrica pode ter mais de uma ao mesmo tempo — por região, por exemplo,
      porque o imposto muda de estado para estado.
    </p>
  </>
);

export const FACTORY_PRICE_LIST_COLUMN_HELP = {
  name: "Como a tabela é chamada — normalmente o nome que veio da fábrica, com o mês ou a campanha.",
  region:
    "Estado ou região onde esta tabela vale. É o que permite duas tabelas ao mesmo tempo com preços diferentes, porque o imposto muda por estado.",
  from: "Primeiro dia em que a tabela passa a valer.",
  to: "Último dia de validade. Vazio significa que ela vale por tempo indeterminado.",
  status:
    "Se a tabela está valendo hoje. Só a tabela vigente é usada para sugerir preço em pedido novo.",
  actions: "Abrir, editar, duplicar ou excluir a tabela.",
} as const;

/** Colunas da tabela de itens (dentro de uma tabela de preços). */
export const PRICE_ITEM_COLUMN_HELP = {
  product: "Produto da fábrica, com o código (SKU) que ela usa.",
  tier: "Nível de preço a que esta linha pertence — o degrau acordado com o cliente.",
  packPrice:
    "Preço da EMBALAGEM inteira, como a fábrica publica na tabela dela (a caixa, o fardo).",
  priceWithTax:
    "O que a embalagem custa com o imposto embutido (ST e afins) já somado.",
  unitPrice:
    "Quanto sai a PEÇA: o preço da embalagem dividido pelo múltiplo de venda. O pedido conta peça, então é este o número que aparece no item.",
  actions: "Alterar o preço desta linha ou removê-la da tabela.",
} as const;

// ── Aba: produtos ────────────────────────────────────────────────────────────

export const FACTORY_PRODUCT_COLUMN_HELP = {
  photo:
    "Foto do produto, usada no catálogo e no PDF do pedido. Envie várias de uma vez pelo botão “Fotos”, casando o nome do arquivo com o código do produto.",
  sku: "Código do produto na fábrica (SKU). É por ele que a importação de planilha e de pedido reconhece o produto.",
  name: "Nome do produto como a fábrica o chama.",
  category:
    "Categoria da sua empresa (não da fábrica), usada para agrupar produtos parecidos de fábricas diferentes.",
  unit: "Unidade de venda e quantas peças vêm na embalagem. O preço da tabela é por embalagem; o pedido conta PEÇA.",
  status:
    "Produto inativo some das buscas de pedido novo, mas continua nos pedidos antigos.",
  actions: "Editar, ativar/desativar ou excluir o produto.",
} as const;

/** Colunas do kit (produto composto por outros). */
export const PRODUCT_COMPONENT_COLUMN_HELP = {
  component: "Produto que entra neste kit.",
  quantity:
    "Quantas peças deste componente vão em UM kit. É o que permite estimar o consumo do componente quando o kit é vendido.",
  actions: "Alterar a quantidade ou tirar o componente do kit.",
} as const;

/**
 * Colunas do preço na ficha do PRODUTO — a mesma informação da tabela de
 * preços, vista do outro lado: aqui é um produto em várias tabelas, lá é uma
 * tabela com vários produtos.
 */
export const PRODUCT_PRICE_COLUMN_HELP = {
  tier: "Nível de preço a que esta linha pertence — o degrau acordado com o cliente.",
  packPrice:
    "Preço da EMBALAGEM inteira, como a fábrica publica na tabela dela (a caixa, o fardo).",
  priceWithTax:
    "O que a embalagem custa com o imposto embutido (ST e afins) já somado.",
  unitPrice:
    "Quanto sai a PEÇA: o preço da embalagem dividido pelo múltiplo de venda. O pedido conta peça, então é este o número que aparece no item.",
  actions: "Alterar o preço desta linha ou removê-la da tabela.",
} as const;

/** Colunas dos impostos do produto. */
export const PRODUCT_TAX_COLUMN_HELP = {
  tax: "Regra de imposto aplicada a este produto (ST, por exemplo). Ela é embutida no preço, ao contrário do IPI, que é cobrado por fora.",
  rate: "Percentual da regra. É o que separa o preço de tabela do preço com imposto que o cliente paga.",
  updatedAt:
    "Quando a regra foi aplicada a este produto pela última vez. Alíquota muda por lei — a data diz se o preço com imposto está apoiado em algo recente.",
} as const;

// ── Lista de fábricas (cards) ────────────────────────────────────────────────

/**
 * Os quatro números do card. São o ACORDO com a fábrica, e cada um responde uma
 * pergunta diferente sobre a mesma comissão: quanto, sobre o quê, quando cai e
 * até quando o acordo vale.
 */
export const FACTORY_CARD_HELP: Record<string, ReactNode> = {
  Comissão: (
    <p>
      Percentual que a representação recebe desta fábrica. Ele é aplicado sobre
      a base ao lado — não sobre o total que o cliente paga, que tem IPI dentro.
    </p>
  ),
  "Base de cálculo": (
    <>
      <p>
        Quando a comissão passa a existir. <b>Faturamento</b>: assim que a
        fábrica emite a nota. <b>Pagamento</b>: conforme o cliente vai pagando
        os boletos.
      </p>
      <p>
        É a diferença entre ter a comissão inteira na nota ou recebê-la em
        pedaços, junto com as parcelas.
      </p>
    </>
  ),
  "Dia de pagamento da fábrica": (
    <p>
      Dia do mês em que esta fábrica repassa a comissão. É por ele que a tela de
      Comissões sabe em qual mês cada valor cai.
    </p>
  ),
  Contrato: (
    <p>
      Até quando o contrato de representação vale. &quot;A renovar&quot; avisa
      com 90 dias de antecedência; expirado não bloqueia nada no sistema, mas é
      um acordo vencido.
    </p>
  ),
};
