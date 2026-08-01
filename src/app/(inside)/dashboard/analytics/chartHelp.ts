import { ChartHelp } from "./interface";

/**
 * Explicação de cada gráfico da aba, exibida no "?" ao lado do título.
 *
 * A ordem aqui segue as partes da história da página (ver storyParts.ts), mas um
 * mesmo tipo de gráfico atende partes diferentes — ticket médio por cliente vive
 * na parte 4 e por fábrica na 6 —, então os blocos indicam em quais partes cada
 * grupo aparece.
 *
 * Fica no pai (e não em cada seção) porque o texto é conteúdo compartilhado por
 * seções irmãs e porque a linguagem só se mantém uniforme se todos os textos
 * puderem ser lidos lado a lado. Regra de escrita: frase curta, sem jargão de
 * relatório ("mediana", "coorte", "curva ABC") e sempre falando do que o
 * usuário vê na tela — barra, linha, cor, fatia.
 */
export const CHART_HELP = {
  // ── Parte 1: como o período fechou ───────────────────────────────────────
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
  // ── Parte 7: quanto sobra para você (comissões) ──────────────────────────
  // O mês de TODOS os gráficos desta seção é o da data em que a comissão cai
  // (recebimento), não o do pedido — é o que responde "quanto entra em agosto".
  commissionsByMonth: {
    what: "A comissão de cada mês, separada em três: o que já entrou, o que a fábrica ainda deve e o que depende do cliente pagar.",
    read: "O mês é o da data em que a comissão cai, não o do pedido. Verde é recebido, azul é a receber e a linha clara é previsto (fábrica que só paga depois que o cliente paga o boleto). Para ver os meses que ainda vão cair, estenda a data final do período no filtro acima.",
    watch:
      "Muita coisa parada em 'a receber' nos meses passados é comissão atrasada para cobrar da fábrica. Previsto alto é dinheiro que ainda depende de boleto pago.",
    insight: {
      kind: "stacked",
      unit: "money",
      subject: "comissões",
      additive: true,
    },
  },
  commissionBySellerMonth: {
    what: "Quanto de comissão cada vendedor ganhou — ou vai ganhar — em cada mês.",
    read: "Cada linha é um vendedor e o ponto é a comissão dele naquele mês, somando o que já recebeu, o que está a receber e o previsto. Aparecem os seis maiores do período. Para ver o que ainda vai cair nos próximos meses, estenda a data final do período no filtro acima.",
    watch:
      "Linha que cai dois ou três meses seguidos é vendedor perdendo faturamento — e o mês da comissão vem depois do mês do pedido, então a queda começou antes do que o gráfico mostra.",
    insight: { kind: "leader", unit: "money", subject: "vendedores" },
  },
  commissionBySellerStatus: {
    what: "A comissão de cada vendedor no período, dividida entre o que ele já recebeu e o que ainda está por vir.",
    read: "A barra inteira é o total do vendedor no período. A parte verde já caiu na conta, a azul a fábrica deve e a clara ainda depende do cliente pagar.",
    watch:
      "Vendedor com barra grande mas quase tudo azul está vendendo bem e recebendo devagar — o problema é de cobrança na fábrica, não de venda.",
    insight: {
      kind: "stacked",
      unit: "money",
      subject: "comissões",
      additive: true,
    },
  },
  commissionByFactory: {
    what: "Quanto de comissão cada fábrica gerou no período, da maior para a menor.",
    read: "Cada barra é uma fábrica e o comprimento é a comissão que ela rendeu — não o quanto foi faturado com ela.",
    watch:
      "Compare com o faturamento por fábrica: marca que fatura muito e aparece pequena aqui paga comissão baixa e ocupa o tempo do vendedor do mesmo jeito.",
    insight: {
      kind: "ranking",
      unit: "money",
      subject: "fábricas",
      additive: true,
    },
  },
  commissionRateByFactory: {
    what: "Quanto de comissão sobra por real faturado em cada fábrica.",
    read: "É a comissão dividida pelo valor faturado das parcelas do período. Pode não bater com a taxa combinada no vínculo: nível de preço, IPI fora da base e faturamento parcial mudam o número real.",
    watch:
      "Fábrica bem abaixo das outras rende pouco por pedido vendido — vale rever a taxa com ela ou dar preferência a quem paga melhor.",
    insight: { kind: "ranking", unit: "percent", subject: "fábricas" },
  },
  commissionOverdue: {
    what: "A comissão que já passou da data de pagamento da fábrica e ainda não caiu.",
    read: "Uma barra por fábrica, dividida pelo tempo de atraso: mostarda até 30 dias, laranja de 31 a 90 e vermelho acima de 90. Só entra o que está a receber — previsto ainda depende do cliente pagar.",
    watch:
      "Vermelho é dinheiro velho parado: ou a fábrica não repassou, ou a parcela não foi conferida no de-para da planilha. Gráfico vazio aqui é boa notícia.",
    insight: {
      kind: "stacked",
      unit: "money",
      subject: "comissões",
      additive: true,
    },
  },

  // ── Volume de pedidos (partes 2, 3 e 5) ──────────────────────────────────
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
  ordersBySeller: {
    what: "Quantos pedidos cada vendedor fechou no período.",
    read: "Aqui é quantidade de vendas, não dinheiro. Quem está no topo vendeu mais VEZES.",
    watch:
      "Compare com o faturamento por vendedor: quem fecha muitos pedidos e fatura pouco está fazendo reposição miúda; o contrário depende de poucos pedidos grandes e sente mais quando um cliente para.",
    insight: {
      kind: "ranking",
      unit: "count",
      subject: "vendedores",
      additive: true,
    },
  },
  ordersAndTicketByMonth: {
    what: "Se o mês cresceu porque houve mais pedidos ou porque cada pedido ficou maior.",
    read: "A barra é quantos pedidos aconteceram no mês; a linha é o valor médio de cada um deles. São grandezas diferentes, por isso a linha tem eixo próprio, à direita.",
    watch:
      "Barra subindo com linha parada: mais vendas do mesmo tamanho. Barra parada com linha subindo: as mesmas vendas, maiores. Barra caindo com linha subindo é o sinal ruim disfarçado — está vendendo para menos gente e só os pedidos grandes seguram o faturamento.",
    insight: { kind: "rate", unit: "count", subject: "meses" },
  },
  ordersBySellerMonth: {
    what: "Quantos pedidos cada vendedor fechou em cada mês.",
    read: "Cada linha é um vendedor e o ponto é o número de pedidos dele naquele mês. Aparecem os cinco maiores do período.",
    watch:
      "Linha caindo há dois ou três meses é vendedor perdendo frequência — costuma aparecer aqui antes de aparecer no faturamento, porque o pedido grande de um cliente disfarça a queda de visita.",
    insight: { kind: "leader", unit: "count", subject: "vendedores" },
  },

  // ── Perfil dos pedidos (partes 2, 5 e 6) ─────────────────────────────────
  orderSizeDistribution: {
    what: "Quantos pedidos do período caíram em cada faixa de valor.",
    read: "Cada barra é uma faixa (da menor para a maior) e a altura é quantos pedidos ficaram nela. Passe o dedo em cima para ver quanto de faturamento aquela faixa representa.",
    watch:
      "A faixa com mais pedidos quase nunca é a que traz mais dinheiro. Se o faturamento se concentra na última faixa e ela tem poucos pedidos, o mês depende de dois ou três clientes grandes.",
    insight: {
      kind: "ranking",
      unit: "count",
      subject: "faixas",
      additive: true,
    },
  },
  itemsPerOrder: {
    what: "Quantos produtos diferentes tem o pedido médio de cada fábrica.",
    read: "A barra conta itens (produtos diferentes), não peças nem dinheiro — o tooltip mostra as peças. Fábricas com pedido mais fundo ficam no topo.",
    watch:
      "Pedido de dois itens é reposição do que já vende; de vinte, coleção comprada. Fábrica com muitos pedidos rasos costuma ter só um produto girando na loja — o resto do catálogo nunca foi oferecido.",
    insight: { kind: "ranking", unit: "count", subject: "fábricas" },
  },
  backorderWeight: {
    what: "Quanto do volume de cada mês é sobra de faturamento parcial, e não venda nova.",
    read: "A barra inteira é o número de pedidos do mês. A parte azul é venda nova; a laranja é sobra — quando a fábrica não tinha estoque de tudo, faturou o que tinha e o restante virou um pedido novo para faturar depois. O dinheiro não é contado duas vezes (o pedido original é reduzido ao que foi faturado), mas o pedido sim: uma venda passa a ocupar duas linhas.",
    watch:
      "Laranja crescendo é fábrica entregando pela metade — e cada sobra é um pedido a mais para acompanhar, cobrar e faturar. Veja o valor em sobras no tooltip: três sobras de R$ 200 é rotina, três de R$ 20 mil é conversa com a fábrica. Vale lembrar que a sobra aparece no mês em que o faturamento parcial aconteceu, não no mês do pedido original.",
    insight: {
      kind: "stacked",
      unit: "count",
      subject: "pedidos",
      additive: true,
    },
  },
  ordersByWeekday: {
    what: "Em que dia da semana os pedidos são fechados.",
    read: "Uma barra por dia, de segunda a domingo. Dia sem pedido aparece zerado, e isso também é resposta.",
    watch:
      "Se quase todo pedido sai no começo da semana, visita marcada para sexta chega depois da decisão de compra — vale conferir a rotina do vendedor contra esse desenho.",
    insight: {
      kind: "ranking",
      unit: "count",
      subject: "dias",
      additive: true,
    },
  },

  // ── Ticket médio por entidade (partes 4, 5 e 6) ──────────────────────────
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

  // ── Cadência: intervalo entre pedidos (partes 4 e 6) ─────────────────────
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

  // ── Partes 2, 3 e 4: o que virou entrega, de quem vem, quem fica ─────────
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

  // ── Parte 5: quem vende e como vende ─────────────────────────────────────
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

  // ── Parte 6: como as fábricas atendem ────────────────────────────────────
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

  // ── Parte 4: sua carteira de clientes ────────────────────────────────────
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
