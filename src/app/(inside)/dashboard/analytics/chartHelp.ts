import { ChartHelp } from "./interface";

/**
 * Explicação de cada gráfico da aba, exibida no "?" ao lado do título.
 *
 * Fica no pai (e não em cada seção) porque o texto é conteúdo compartilhado por
 * seções irmãs e porque a linguagem só se mantém uniforme se todos os textos
 * puderem ser lidos lado a lado. Regra de escrita: frase curta, sem jargão de
 * relatório ("mediana", "coorte", "curva ABC") e sempre falando do que o
 * usuário vê na tela — barra, linha, cor, fatia.
 */
export const CHART_HELP = {
  // ── Visão geral ──────────────────────────────────────────────────────────
  revenueByMonth: {
    what: "O total faturado em cada mês do período escolhido.",
    read: "A linha sobe nos meses em que a empresa faturou mais e desce nos meses mais fracos. Passe o dedo em cima de um ponto para ver o valor daquele mês.",
    watch:
      "Três meses seguidos em queda não são um mês ruim: é tendência, e vale investigar qual fábrica ou cliente parou de comprar.",
    insight: { kind: "trend", unit: "money", subject: "meses" },
  },
  ordersByMonth: {
    what: "Quantos pedidos foram feitos em cada mês.",
    read: "Aqui é quantidade, não dinheiro. Um mês com muitos pedidos pequenos e um mês com poucos pedidos grandes podem faturar igual.",
    watch:
      "Compare com o gráfico de faturamento: se os pedidos caem mas o faturamento se mantém, você está vendendo menos vezes e mais caro.",
    insight: { kind: "trend", unit: "count", subject: "meses" },
  },
  revenueByFactory: {
    what: "Quanto cada fábrica faturou no período, da maior para a menor.",
    read: "Cada barra é uma fábrica, e o comprimento dela é o valor faturado com aquela marca.",
    watch:
      "Se uma fábrica sozinha responde por quase tudo, a empresa fica dependente dela — em preço, prazo e reajuste.",
    insight: {
      kind: "ranking",
      unit: "money",
      subject: "fábricas",
      additive: true,
    },
  },
  commissionsByMonth: {
    what: "A comissão de cada mês, separada entre o que já entrou no caixa e o que ainda está para entrar.",
    read: "O mês usado é o da data prevista de recebimento da parcela, não o do pedido.",
    watch:
      "Muita coisa parada em 'a receber' nos meses passados é sinal de comissão atrasada para cobrar da fábrica.",
    insight: {
      kind: "stacked",
      unit: "money",
      subject: "comissões",
      additive: true,
    },
  },

  // ── Volume de pedidos ────────────────────────────────────────────────────
  ordersByFactory: {
    what: "Como os pedidos do período se dividem entre as fábricas.",
    read: "A rosca mostra participação: cada fatia é uma fábrica e o tamanho dela é a parte que ela representa no total de pedidos.",
    watch:
      "Fatias muito pequenas são fábricas que quase não giram — ou o vendedor não oferece, ou o cliente não quer.",
    insight: { kind: "share", unit: "count", subject: "fábricas" },
  },
  ordersByClient: {
    what: "Os clientes que mais fizeram pedidos no período.",
    read: "Cada barra é um cliente, e o comprimento é o número de pedidos. Os que mais compram ficam no topo.",
    watch:
      "Compra frequente é sinal de relacionamento firme. Um cliente grande que não aparece nessa lista costuma estar comprando de outro representante.",
    insight: {
      kind: "ranking",
      unit: "count",
      subject: "clientes",
      additive: true,
    },
  },

  // ── Ticket médio ─────────────────────────────────────────────────────────
  avgTicketBySeller: {
    what: "O valor médio de um pedido de cada vendedor.",
    read: "É o faturamento dele dividido pelo número de pedidos dele. Não mede quem vendeu mais, e sim quem fecha pedidos maiores.",
    watch:
      "Ticket baixo com muitos pedidos indica venda de reposição; ticket alto com poucos pedidos indica venda de campanha.",
    insight: { kind: "ranking", unit: "money", subject: "vendedores" },
  },
  avgTicketByFactory: {
    what: "Quanto vale, em média, um pedido de cada fábrica.",
    read: "Depende do preço e do tamanho do mix da marca — fábricas caras aparecem naturalmente em cima.",
    watch:
      "Uma fábrica com ticket muito abaixo das outras dá trabalho parecido e rende menos por pedido.",
    insight: { kind: "ranking", unit: "money", subject: "fábricas" },
  },
  avgTicketByClient: {
    what: "Quanto o cliente costuma gastar por pedido.",
    read: "É a média dos pedidos daquele cliente no período, e não o total que ele comprou.",
    watch:
      "Cliente com ticket pequeno e compra frequente é candidato a juntar pedidos e ganhar escala.",
    insight: { kind: "ranking", unit: "money", subject: "clientes" },
  },

  // ── Cadência de pedidos ──────────────────────────────────────────────────
  orderIntervalByFactory: {
    what: "Quantos dias, em média, se passam entre um pedido e o seguinte de cada fábrica.",
    read: "Quanto menor a barra, mais rápido o cliente volta a pedir aquela marca.",
    watch:
      "Intervalo grande pode ser natureza do produto (item que dura) ou sinal de que a marca saiu da rotina de compra.",
    insight: {
      kind: "ranking",
      unit: "days",
      subject: "fábricas",
      topIsBad: true,
    },
  },
  orderIntervalByClient: {
    what: "De quanto em quanto tempo cada cliente costuma fazer um novo pedido.",
    read: "É o ritmo do próprio cliente. Serve de referência: passou muito desse prazo, ele está atrasado.",
    watch:
      "Use junto com 'Clientes que estão sumindo' — lá o atraso é medido contra este ritmo.",
    insight: {
      kind: "ranking",
      unit: "days",
      subject: "clientes",
      topIsBad: true,
    },
  },

  // ── Evolução da empresa ──────────────────────────────────────────────────
  avgTicketByMonth: {
    what: "Se o valor de cada pedido vem crescendo ou encolhendo ao longo dos meses.",
    read: "A linha é a média dos pedidos do mês. No tooltip aparece também quantos pedidos formaram aquela média.",
    watch:
      "Mês com poucos pedidos faz a média balançar muito — antes de comemorar ou se assustar, olhe a quantidade.",
    insight: { kind: "trend", unit: "money", subject: "meses" },
  },
  newVsReturning: {
    what: "Quantos clientes compraram no mês, separando quem comprou pela primeira vez de quem já era cliente.",
    read: "A barra inteira é o total de clientes que compraram. A parte verde é quem voltou; a azul, quem estreou.",
    watch:
      "Se a barra só se mantém de pé por cliente novo, a carteira antiga está escapando pela porta dos fundos.",
    insight: { kind: "stacked", unit: "count", subject: "clientes" },
  },
  orderStatusByMonth: {
    what: "Em que situação estão hoje os pedidos feitos em cada mês.",
    read: "Cada barra é um mês, dividida por situação: orçamento, confirmado, faturado, entregue e cancelado (em vermelho).",
    watch:
      "Muito orçamento parado em meses antigos é venda que nunca fechou; muito vermelho é problema com o cliente ou com a fábrica.",
    insight: {
      kind: "stacked",
      unit: "count",
      subject: "pedidos",
      additive: true,
    },
  },
  revenueConcentration: {
    what: "Quanto do faturamento vem dos maiores clientes.",
    read: "As barras são o valor de cada cliente, do maior para o menor. A linha vai somando: no primeiro cliente ela mostra a fatia dele, no segundo a soma dos dois, e assim por diante.",
    watch:
      "Se a linha já está perto do topo nos três primeiros clientes, perder um deles derruba o mês inteiro.",
    insight: { kind: "concentration", unit: "money", subject: "clientes" },
  },

  // ── Evolução dos vendedores ──────────────────────────────────────────────
  revenueBySellerMonth: {
    what: "Quanto cada vendedor faturou mês a mês.",
    read: "Cada linha colorida é um vendedor. Clique num nome da legenda para esconder ou mostrar a linha dele.",
    watch:
      "O que importa é o formato da linha, não a altura: um vendedor menor subindo todo mês vale mais atenção que um grande parado.",
    insight: { kind: "leader", unit: "money", subject: "vendedores" },
  },
  visitConversion: {
    what: "Quantas visitas foram feitas no mês e qual parte delas terminou em pedido.",
    read: "A barra é o número de visitas (o esforço). A linha é a porcentagem que virou pedido (o resultado).",
    watch:
      "Barra alta com linha baixa é roteiro mal escolhido, não falta de trabalho: está visitando quem não estava pronto para comprar.",
    insight: { kind: "rate", unit: "percent", subject: "visitas" },
  },
  walletCoverage: {
    what: "Que parte dos clientes de cada vendedor fez pelo menos um pedido no período.",
    read: "A barra é a porcentagem. No tooltip aparecem os números reais, do tipo '12 de 40 clientes'.",
    watch:
      "Cobertura baixa quer dizer carteira grande no papel e pequena na prática — tem cliente cadastrado que ninguém atende.",
    insight: { kind: "ranking", unit: "percent", subject: "vendedores" },
  },

  // ── Evolução das fábricas ────────────────────────────────────────────────
  revenueByFactoryMonth: {
    what: "Quanto cada fábrica faturou mês a mês.",
    read: "Cada linha colorida é uma fábrica. Clique num nome da legenda para esconder ou mostrar a linha dela.",
    watch:
      "Linha que despenca de um mês para o outro costuma ser falta de produto ou tabela de preço nova que travou a venda.",
    insight: { kind: "leader", unit: "money", subject: "fábricas" },
  },
  deliveryPerformance: {
    what: "Se a fábrica entrega no prazo que ela mesma prometeu.",
    read: "Para cada fábrica há duas barras: a cinza é o prazo prometido e a vermelha é o que levou de verdade. Vermelha maior que cinza é atraso.",
    watch:
      "Antes de cobrar a fábrica, veja no tooltip sobre quantas entregas essa média foi feita — duas entregas não provam nada.",
    insight: { kind: "compare", unit: "days", subject: "fábricas" },
  },

  // ── Comportamento dos clientes ───────────────────────────────────────────
  clientsAtRisk: {
    what: "Clientes que estão há tempo demais sem comprar, comparados ao ritmo deles mesmos.",
    read: "A barra são os dias parados. Vermelho é quem já passou do próprio costume de compra; cinza é quem está chegando no limite.",
    watch:
      "Quem compra a cada 20 dias e sumiu há 60 é mais urgente que quem compra a cada 90 e sumiu há 100 — por isso a ordem não é só por dias.",
    insight: {
      kind: "ranking",
      unit: "days",
      subject: "clientes",
      topIsBad: true,
    },
  },
  clientRetention: {
    what: "Se os clientes de um mês continuam comprando no mês seguinte.",
    read: "A barra é quantos clientes compraram no mês. A linha é a fatia deles que já comprava no mês anterior. O primeiro mês sempre marca 0%, porque não há mês anterior dentro do período.",
    watch:
      "Linha baixa quer dizer base que se renova toda hora: você vende sempre para gente diferente e recomeça todo mês.",
    insight: { kind: "rate", unit: "percent", subject: "clientes" },
  },
} satisfies Record<string, ChartHelp>;
