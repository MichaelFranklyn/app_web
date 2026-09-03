/**
 * As abas escondidas: o que as fórmulas consultam.
 *
 * Elas vão ocultas porque o vendedor não tem nada a fazer ali — a folha é uma
 * só. E são matrizes puras (sem ExcelJS) para poderem ser conferidas em teste:
 * é aqui que mora a tradução entre o pacote do backend e o que a fórmula espera
 * encontrar, coluna por coluna.
 */

import type { OrderSheetPackage } from "./interface";
import { ORDER_SHEET_FORMAT } from "./version";

export type Row = (string | number)[];

/** Junta o endereço numa linha só, como sai numa etiqueta. */
export const addressLine = (client: {
  addressStreet: string | null;
  addressNumber: string | null;
  addressNeighborhood: string | null;
}): string =>
  [
    [client.addressStreet, client.addressNumber].filter(Boolean).join(", "),
    client.addressNeighborhood,
  ]
    .filter(Boolean)
    .join(" - ");

/**
 * Os níveis que viram coluna de preço, em ordem alfabética.
 *
 * Vem da união de todas as fábricas: níveis com o mesmo nome compartilham a
 * coluna, e não há conflito porque cada produto é de uma fábrica só.
 */
export const priceTierNames = (pkg: OrderSheetPackage): string[] => {
  const names = new Set<string>();
  pkg.factories.forEach((factory) =>
    factory.tiers.forEach((tier) => names.add(tier.name))
  );
  return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
};

const CATALOG_HEADER = [
  "CHAVE",
  "FABRICA",
  "CODIGO",
  "DESCRICAO",
  "EMBALAGEM",
  "UNID_POR_EMB",
  "MULTIPLO",
  "IMPOSTOS_PCT",
  "NCM",
];

/**
 * Uma linha por produto, com um preço por nível.
 *
 * A chave é `fábrica|código`: o SKU só é único dentro da fábrica, então buscar
 * pelo código puro devolveria o produto errado quando duas fábricas repetem a
 * numeração.
 *
 * `IMPOSTOS_PCT` já vem somado (ST + o IPI que a fábrica cobra por fora) porque
 * a alíquota é constante por produto — a folha multiplica e pronto.
 */
export const buildCatalogRows = (pkg: OrderSheetPackage): Row[] => {
  const tierNames = priceTierNames(pkg);
  const factoryName = new Map(pkg.factories.map((f) => [f.id, f.name]));

  const rows: Row[] = [[...CATALOG_HEADER, ...tierNames]];

  pkg.products.forEach((product) => {
    const factory = factoryName.get(product.factoryId);
    if (!factory) return;

    const priceByTier = new Map(
      product.prices.map((price) => [
        price.tierName ?? "",
        Number(price.packPrice),
      ])
    );

    rows.push([
      `${factory}|${product.sku}`,
      factory,
      product.sku,
      product.name,
      product.unitLabel ?? "",
      Number(product.unitPerPack),
      product.saleMultiple ? Number(product.saleMultiple) : "",
      Number(product.taxRate) + Number(product.ipiRate),
      product.ncm ?? "",
      ...tierNames.map((tier) => priceByTier.get(tier) ?? ""),
    ]);
  });

  return rows;
};

/** A carteira, buscada pelo CNPJ só com dígitos. */
export const buildClientRows = (pkg: OrderSheetPackage): Row[] => [
  ["CNPJ", "RAZAO_SOCIAL", "FANTASIA", "ENDERECO", "CIDADE_UF", "ID"],
  ...pkg.clients.map((client) => [
    client.cnpjDigits,
    client.razaoSocial,
    client.nomeFantasia ?? "",
    addressLine(client),
    [client.addressCity, client.addressState].filter(Boolean).join("/"),
    client.id,
  ]),
];

/**
 * O nível acordado, por cliente E fábrica.
 *
 * Vínculo sem nível fica de fora: a folha trata "não achei" como "sem vínculo",
 * e uma linha com o nível em branco daria um preço vazio sem explicar por quê.
 */
export const buildLinkRows = (pkg: OrderSheetPackage): Row[] => {
  const cnpjById = new Map(pkg.clients.map((c) => [c.id, c.cnpjDigits]));
  const factoryName = new Map(pkg.factories.map((f) => [f.id, f.name]));

  const rows: Row[] = [["CHAVE", "NIVEL"]];
  pkg.links.forEach((link) => {
    const cnpj = cnpjById.get(link.clientId);
    const factory = factoryName.get(link.factoryId);
    if (!cnpj || !factory || !link.tierName) return;
    rows.push([`${cnpj}|${factory}`, link.tierName]);
  });
  return rows;
};

/**
 * Uma linha por fábrica, com os prazos dela a partir da quarta coluna.
 *
 * É esta forma que sustenta o prazo dependente da fábrica: cada linha vira um
 * intervalo nomeado, e o dropdown do prazo aponta para o intervalo da fábrica
 * escolhida.
 */
export const buildFactoryRows = (pkg: OrderSheetPackage): Row[] => [
  ["FABRICA", "ID", "ENTREGA_DIAS", "FRETE", "PRAZOS"],
  ...pkg.factories.map((factory) => [
    factory.name,
    factory.id,
    factory.deliveryEstimateDays ?? "",
    "",
    ...factory.paymentTerms.map((term) => term.name),
  ]),
];

/**
 * O que identifica a ficha para o importador.
 *
 * `sellerId` é o campo que decide de quem é o pedido — o escritório sobe a
 * ficha de qualquer vendedor e ela continua sendo dele. As tabelas de preço
 * ficam registradas para a revisão avisar quando a ficha foi preenchida sobre
 * uma tabela que já não é a vigente.
 */
export const buildMetaRows = (pkg: OrderSheetPackage): Row[] => [
  ["CHAVE", "VALOR"],
  ["formato", ORDER_SHEET_FORMAT],
  ["versao", pkg.formatVersion],
  ["empresa", pkg.companyId],
  ["vendedor", pkg.seller.id],
  ["vendedor_nome", pkg.seller.name],
  ["gerado_em", pkg.generatedAt],
  ["tabelas", pkg.factories.flatMap((f) => f.priceListIds).join(",")],
];
