/**
 * O que cada acontecimento desatualiza no cache do Apollo.
 *
 * Os nomes são os do SCHEMA (nunca o alias do documento — ver
 * `useInvalidateQueries`), e a lista é uma só por assunto porque quem cria um
 * pedido pela lista, pela ficha da fábrica, pela ficha do cliente e pela visita
 * desatualiza exatamente as mesmas telas. Enquanto cada ponto escolhia o que
 * lembrava, havia cinco combinações diferentes para o mesmo evento: criar pela
 * ficha do cliente não invalidava nada e o resumo por fábrica só mudava com F5;
 * criar pela ficha da fábrica esquecia os KPIs de /orders; criar pela lista
 * esquecia a ficha do cliente.
 */

/**
 * Um pedido nasceu, mudou de valor ou deixou de existir.
 *
 * - `orders` / `orderStats`: a lista de pedidos e os cartões dela.
 * - `companyClient`: a ficha do cliente — resumo por fábrica, KPIs e a data da
 *   última compra vivem nela.
 * - `clients` / `clientStats`: a lista de clientes mostra "última compra" e
 *   conta quem está atrasado para voltar.
 */
export const ORDER_CACHE_FIELDS = [
  "orders",
  "orderStats",
  "companyClient",
  "clients",
  "clientStats",
  // A aba de produtos da ficha do cliente resume o que ele compra: é leitura
  // derivada dos pedidos, e ninguém mais a atualiza.
  "clientProductAnalysis",
];

/**
 * Uma parcela mudou de estado: recebida, paga ao vendedor, conferida,
 * inadimplente, estornada, revertida ou baixada em lote.
 *
 * - `commissions`: a tela de comissões, o relatório de comissões e o PDF leem
 *   o MESMO campo com variáveis diferentes (com e sem período). São entradas de
 *   cache distintas, então o refetch de uma não alcança a outra.
 * - `order`: as parcelas moram dentro do pedido, e o detalhe é `cache-first` —
 *   sem isto, o pedido aberto depois mostra a parcela no estado anterior.
 */
export const COMMISSION_CACHE_FIELDS = ["commissions", "order"];

/**
 * Uma visita foi criada, remarcada, concluída ou teve o resultado alterado.
 *
 * As duas telas mostram a mesma visita por caminhos diferentes: a rotina lê a
 * semana inteira (`visitSchedules`) e a ficha do cliente lê o histórico dele
 * (`visitsByCompanyClient`). Quem mexe pela rotina precisa da ficha, e
 * vice-versa.
 */
export const VISIT_CACHE_FIELDS = ["visitsByCompanyClient", "visitSchedules"];

/**
 * O vínculo vendedor→cliente→fábrica nasceu, mudou ou foi desfeito.
 *
 * Ele é editável pelas DUAS pontas (aba "Clientes" da fábrica e aba "Fábricas"
 * da ficha do cliente), e as duas leem `sellerClientFactoryList` — junto com a
 * carteira do vendedor e os selects de vínculo do pedido.
 */
export const CLIENT_FACTORY_LINK_CACHE_FIELDS = [
  "sellerClientFactoryList",
  // Prioridade e frequência entram no score do vínculo, que o backend
  // recalcula: o header e a aba de score vivem sob `companyClient`, e o
  // histórico sob `clientVisitScores`.
  "companyClient",
  "clientVisitScores",
];

/**
 * O estoque estimado do cliente mudou — por observação de visita ou por
 * telefonema.
 *
 * O backend corrige a previsão de esgotamento e recalcula o score na hora, e
 * esses números aparecem em quatro lugares diferentes: a tabela da aba Estoque,
 * os cards de estoque e o score da ficha, o histórico do score e a coluna de
 * score da lista de clientes.
 */
export const CLIENT_STOCK_CACHE_FIELDS = [
  "clientProductInsights",
  "companyClient",
  "clientVisitScores",
  "clients",
  // Mesma leitura derivada do assunto pedido: a aba de produtos do cliente
  // cruza compras com o estoque observado.
  "clientProductAnalysis",
];

/**
 * Um preço lançado (item de tabela) nasceu, mudou de valor, entrou em promoção
 * ou saiu da tabela.
 *
 * `priceListItems` é lido por DOIS caminhos com variáveis diferentes — a tabela
 * de preço (filtrando pela lista) e a ficha do produto (filtrando pelo produto)
 * —, e entradas de cache diferentes não se falam: mexer por um lado deixava o
 * outro mostrando o preço anterior.
 */
export const PRICE_ITEM_CACHE_FIELDS = ["priceListItems"];

/**
 * Um produto saiu do catálogo.
 *
 * O backend cascateia (ver `delete_product.py`): os preços lançados dele, os
 * impostos e as composições de kit somem junto. `product` é a ficha, que a aba
 * de componentes lê para montar a lista.
 */
export const PRODUCT_CACHE_FIELDS = [
  "products",
  "product",
  "priceListItems",
  "productTaxes",
];

/**
 * Uma tabela de preço nasceu, foi clonada, importada ou removida.
 *
 * Remover leva os itens junto (ver `delete_factory_price_list.py`), e a ficha
 * do produto lista preços de todas as tabelas.
 */
export const PRICE_LIST_CACHE_FIELDS = [
  "factoryPriceLists",
  // A ficha da tabela (nome, vigência, promoção) é outro campo: editar pela
  // aba deixava o detalhe com o nome antigo.
  "factoryPriceList",
  "priceListItems",
];

/**
 * Um atendimento entrou ou saiu da fila.
 *
 * Os cartões do topo (`clientSupportCounts`) são contagens do servidor: só a
 * lista não basta.
 */
export const SUPPORT_CACHE_FIELDS = [
  "clientSupportCases",
  "clientSupportCounts",
];

/**
 * O vínculo com a fábrica foi desfeito.
 *
 * `delete_company_factory.py` cascateia sete coisas: acesso de vendedor,
 * carteira vendedor-cliente-fábrica, produtos, tabelas de preço, itens de
 * preço, níveis e modelos de importação. Invalidar só `companyFactories`
 * deixava tudo isso no cache, de uma fábrica que não existe mais.
 */
export const FACTORY_CACHE_FIELDS = [
  "companyFactories",
  "sellerFactoryAccessList",
  "sellerClientFactoryList",
  "products",
  "factoryPriceLists",
  "priceListItems",
  "priceTiers",
  "importTemplates",
];

/**
 * Um nível comercial (tabela de faixa de preço) nasceu, mudou de nome ou saiu.
 *
 * Ele é escolhido em quatro telas além da própria aba: preço de tabela, preço
 * da ficha do produto, item de pedido e vínculo cliente-fábrica.
 */
export const PRICE_TIER_CACHE_FIELDS = ["priceTiers"];

/**
 * Uma pessoa foi criada, editada, ativada/desativada ou removida.
 *
 * `users` é a lista, `user` é a ficha dela (aberta por outra rota) e `sellers`
 * é o cadastro de vendedor que alimenta os selects e a rota do dia. Editar por
 * um caminho tem de aparecer nos outros dois.
 */
export const USER_CACHE_FIELDS = ["users", "user", "sellers"];

/**
 * Uma rede de clientes nasceu, mudou de nome ou saiu.
 *
 * A lista e a ficha da rede são campos distintos, e o filtro por rede da lista
 * de clientes lê o mesmo catálogo.
 */
export const CLIENT_NETWORK_CACHE_FIELDS = ["clientNetworks", "clientNetwork"];
