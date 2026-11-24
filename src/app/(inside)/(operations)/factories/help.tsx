import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
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
  <div className="flex flex-col gap-2">
    <Title variant="label" weight="semibold">
      Cliente da fábrica
    </Title>
    <Title variant="body-sm">
      Diz quais clientes da sua carteira compram{" "}
      <Emphasis>desta fábrica</Emphasis>, por qual vendedor e em qual nível de
      preço. Só clientes vinculados aqui podem ter pedidos desta fábrica.
    </Title>
    <Title variant="body-sm">
      O <Emphasis>nível</Emphasis> do cliente decide o preço e o prazo sugeridos
      no pedido. Para mudar o nível de muitos clientes de uma vez — todos de uma
      cidade, de um segmento ou de uma rede — use{" "}
      <Emphasis>Nível em massa</Emphasis>.
    </Title>
  </div>
);

export const FACTORY_CLIENT_COLUMN_HELP = {
  client:
    "Cliente vinculado a esta fábrica. Clique na linha para abrir a ficha dele.",
  seller:
    "Vendedor que atende este cliente NESTA fábrica. Só aparece quem tem acesso ativo à fábrica.",
  priceTier:
    "Nível de preço acordado com o cliente: é ele que decide qual preço da tabela vale nos pedidos deste cliente e qual prazo é sugerido primeiro. Vínculo sem nível usa o preço padrão da tabela. Para trocar o nível de vários clientes de uma vez, use “Nível em massa”.",
  priority:
    "Peso que este cliente tem na rota de visita desta fábrica. Prioridade alta puxa o cliente para cima no score.",
  lastInvoice:
    "Dia da nota mais recente deste vínculo — deste vendedor, nesta fábrica. Vazio significa que ainda não houve faturamento, mesmo que exista pedido em aberto.",
  status:
    "Cliente negativado nesta fábrica está com o crédito suspenso aqui: ele sai das recomendações de visita desta fábrica e não pode receber pedido novo dela. As outras fábricas dele continuam normais.",
  actions:
    "Trocar o nível ou a prioridade do vínculo, marcar o cliente como negativado nesta fábrica, ou desfazer o vínculo. Para mudar o nível de um grupo inteiro, use “Nível em massa”, no alto.",
} as const;

// ── Aba: vendedores com acesso ───────────────────────────────────────────────

export const FACTORY_SELLERS_HELP: ReactNode = (
  <div className="flex flex-col gap-2">
    <Title variant="label" weight="semibold">
      Acesso de vendedor
    </Title>
    <Title variant="body-sm">
      Diz quais vendedores podem vender os produtos desta fábrica. Só vendedores
      com acesso <Emphasis>ativo</Emphasis> aparecem na hora de vincular
      clientes e registrar pedidos dela.
    </Title>
    <Title variant="body-sm">
      É aqui também que se combina <Emphasis>a comissão de cada um</Emphasis>{" "}
      nesta fábrica: o percentual que ele ganha por pedido e quando o escritório
      repassa.
    </Title>
    <Title variant="body-sm" color="muted">
      <Emphasis>Desativar</Emphasis> pausa as vendas e pode ser desfeito quando
      quiser. <Emphasis>Excluir</Emphasis> tira o vendedor desta lista. Nos dois
      casos os pedidos já feitos continuam guardados.
    </Title>
  </div>
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
  <div className="flex flex-col gap-2">
    <Title variant="label" weight="semibold">
      Nível comercial
    </Title>
    <Title variant="body-sm">
      Tipo de cliente que paga um preço diferente — por exemplo, Capital ×
      Interior, ou Varejo × Atacado. Cada tabela de preços tem um preço por
      nível.
    </Title>
    <Title variant="body-sm">
      O nível pode ter <Emphasis>preço próprio</Emphasis> (vindo da planilha da
      fábrica) ou ser um <Emphasis>percentual sobre outro nível</Emphasis> —
      ex.: Interior = Capital +8%. O calculado não precisa de planilha: o preço
      é refeito sozinho quando o outro muda.
    </Title>
    <Title variant="body-sm" color="muted">
      O nível de cada cliente se escolhe na aba Clientes. Os prazos de pagamento
      também podem ser ligados a um nível.
    </Title>
  </div>
);

export const FACTORY_TIER_COLUMN_HELP = {
  tier: "Nome do nível, como a fábrica o chama. Quando ele é calculado, aparece embaixo sobre qual nível e quanto (ex.: “Gold −10%”) — o preço dele é refeito sozinho e não se edita à mão.",
  actions:
    "Renomear o nível, mudar o percentual (ou voltar a preço próprio) e removê-lo.",
} as const;

// ── Aba: condições de pagamento ──────────────────────────────────────────────

export const FACTORY_PAYMENT_TERMS_HELP: ReactNode = (
  <div className="flex flex-col gap-2">
    <Title variant="label" weight="semibold">
      Prazo de pagamento
    </Title>
    <Title variant="body-sm">
      Os vencimentos das parcelas do pedido — por exemplo, &quot;30/60/90&quot;
      gera 3 <Emphasis>boletos</Emphasis>, para 30, 60 e 90 dias. Ao criar um
      pedido você escolhe um destes prazos.
    </Title>
    <Title variant="body-sm" color="muted">
      Um prazo pode exigir um <Emphasis>valor mínimo</Emphasis> do pedido, e
      pode ser ligado a um <Emphasis>nível</Emphasis>: aí ele é sugerido
      primeiro nos pedidos dos clientes desse nível.
    </Title>
  </div>
);

export const FACTORY_PAYMENT_TERM_COLUMN_HELP = {
  days: "Em quantos dias cada boleto vence, contados da base que esta fábrica usa (a nota ou o pedido). “30/60/90” são três boletos.",
  installments:
    "Quantos boletos o prazo gera — é a quantidade de vencimentos ao lado.",
  minimum:
    "Valor mínimo do pedido para este prazo ficar disponível. Abaixo dele, o prazo nem aparece na hora de fechar o pedido.",
  tier: "Para quais clientes o prazo vale. Um prazo do nível “Interior” é sugerido primeiro nos pedidos dos clientes desse nível; “Todos” vale para qualquer cliente.",
  actions: "Alterar os vencimentos, o mínimo e o nível, ou remover a condição.",
} as const;

// ── Aba: tabelas de preço ────────────────────────────────────────────────────

export const FACTORY_PRICE_LISTS_HELP: ReactNode = (
  <div className="flex flex-col gap-2">
    <Title variant="label" weight="semibold">
      Tabela de preço
    </Title>
    <Title variant="body-sm">
      A lista que a fábrica publica: um preço por produto, por{" "}
      <Emphasis>nível</Emphasis>, valendo num período — promoções, reajustes,
      histórico.
    </Title>
    <Title variant="body-sm">
      Preço diferente para um grupo de clientes (Capital × Interior, por
      exemplo) não é outra tabela: é outro <Emphasis>nível</Emphasis> na mesma
      tabela. Duas tabelas ao mesmo tempo, só quando o imposto muda de estado
      para estado.
    </Title>
    <Title variant="body-sm" color="muted">
      Clique numa linha para abrir a tabela e ver os preços.
    </Title>
  </div>
);

export const FACTORY_PRICE_LIST_COLUMN_HELP = {
  name: "Como a tabela é chamada — normalmente o nome que veio da fábrica, com o mês ou a campanha.",
  region:
    "Região fiscal: o estado ou a alíquota de imposto em que esta tabela vale. Preço por grupo de clientes (capital × interior) não vai aqui — vira nível dentro da tabela.",
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
    <Title variant="body-sm">
      Percentual que a representação recebe desta fábrica. Ele é aplicado sobre
      a base ao lado — não sobre o total que o cliente paga, que tem IPI dentro.
    </Title>
  ),
  // As duas entradas abaixo são as mesmas perguntas, feitas pelo VENDEDOR: o
  // card dele mostra o acordo dele com a empresa, não o da empresa com a fábrica.
  "Sua comissão": (
    <Title variant="body-sm">
      Quanto você ganha nos pedidos desta fábrica, em % do valor do pedido
      (mercadoria sem IPI). É o combinado com a sua empresa — não o que a
      fábrica paga para a representação. &quot;Não cadastrada&quot; quer dizer
      que o seu percentual ainda não foi registrado: fale com o seu gestor.
    </Title>
  ),
  "Quando você recebe": (
    <Title variant="body-sm">
      <Emphasis>Faturamento</Emphasis>: a sua comissão conta assim que a fábrica
      emite a nota. <Emphasis>Pagamento</Emphasis>: conforme o cliente vai
      pagando os boletos.
    </Title>
  ),
  "Base de cálculo": (
    <>
      <Title variant="body-sm">
        Quando a comissão passa a existir. <Emphasis>Faturamento</Emphasis>:
        assim que a fábrica emite a nota. <Emphasis>Pagamento</Emphasis>:
        conforme o cliente vai pagando os boletos.
      </Title>
      <Title variant="body-sm">
        É a diferença entre ter a comissão inteira na nota ou recebê-la em
        pedaços, junto com as parcelas.
      </Title>
    </>
  ),
  "Dia de pagamento da fábrica": (
    <Title variant="body-sm">
      Dia do mês em que esta fábrica repassa a comissão. É por ele que a tela de
      Comissões sabe em qual mês cada valor cai.
    </Title>
  ),
  Contrato: (
    <Title variant="body-sm">
      Até quando o contrato de representação vale. &quot;A renovar&quot; avisa
      com 90 dias de antecedência; expirado não bloqueia nada no sistema, mas é
      um acordo vencido.
    </Title>
  ),
};
