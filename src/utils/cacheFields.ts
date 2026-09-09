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
];
