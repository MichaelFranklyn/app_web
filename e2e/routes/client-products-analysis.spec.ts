import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Aba Produtos do cliente: o que ele sempre compra e o que parou de comprar.
 *
 * A tela afirma coisas fortes ("parou de comprar") a partir de uma conta que o
 * vendedor não vê. O que estes testes guardam é a leitura: o status vem do
 * backend, os cartões do topo são somados sobre a MESMA lista que a tabela
 * mostra, e o período escolhido chega ao servidor.
 */
const clientLayout = () => ({
  CompanyClient: () => ({
    companyClient: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        id: "cc-1",
        notes: null,
        isActive: true,
        client: {
          id: "client-1",
          cnpj: "12345678000190",
          razaoSocial: "Cliente Produtos LTDA",
          nomeFantasia: "Cliente Produtos",
          cnae: null,
          cnaeDescription: null,
          addressStreet: null,
          addressNumber: null,
          addressComplement: null,
          addressNeighborhood: null,
          addressZip: null,
          addressCity: null,
          addressState: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    },
  }),
});

const row = (overrides: Record<string, unknown> = {}) => ({
  productId: "p-1",
  factoryId: "f-1",
  orderCount: 8,
  factoryOrderCount: 9,
  firstPurchaseDate: "2025-01-10",
  lastPurchaseDate: "2026-06-10",
  daysSinceLast: 85,
  totalUnits: "160",
  avgUnits: "20",
  lastUnits: "24",
  totalAmount: "3200",
  avgIntervalDays: 30,
  expectedNextDate: "2026-07-10",
  overdueDays: 55,
  status: "STOPPED",
  product: { id: "p-1", name: "CHUVEIRO 8 C/BRACO", sku: "1000630" },
  factory: {
    id: "f-1",
    razaoSocial: "HERC LTDA",
    nomeFantasia: "HERC",
    nickname: null,
  },
  ...overrides,
});

test("cliente/produtos: mostra a situação do produto e o item fixo", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...clientLayout(),
    ClientProductAnalysis: () => ({
      clientProductAnalysis: [
        row(),
        row({
          productId: "p-2",
          status: "ON_TRACK",
          orderCount: 2,
          daysSinceLast: 10,
          product: { id: "p-2", name: "RALO QUADRADO", sku: "2269" },
        }),
      ],
    }),
  });
  await page.goto("/clients/cc-1/products");

  await expect(page.getByText("CHUVEIRO 8 C/BRACO")).toBeVisible();
  await expect(page.getByText("Parou de comprar").first()).toBeVisible();
  // 8 de 9 pedidos: é o produto que quase todo pedido daquela fábrica leva.
  await expect(page.getByText("8 de 9 pedidos")).toBeVisible();
  await expect(page.getByText("Item fixo")).toBeVisible();
  await expect(page.getByText("a cada 30 dias").first()).toBeVisible();
});

test("cliente/produtos: os cartões somam a mesma lista da tabela", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...clientLayout(),
    ClientProductAnalysis: () => ({
      clientProductAnalysis: [
        row(),
        row({ productId: "p-2", status: "STOPPED" }),
        row({ productId: "p-3", status: "LATE" }),
      ],
    }),
  });
  await page.goto("/clients/cc-1/products");

  const parou = page
    .locator("div")
    .filter({ hasText: /^2Parou de comprar$/ })
    .first();
  await expect(parou).toBeVisible();
  await expect(page.getByText("3 de 3 produto(s)")).toBeVisible();
});

test("cliente/produtos: o período escolhido chega ao servidor", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...clientLayout(),
    ClientProductAnalysis: () => ({ clientProductAnalysis: [row()] }),
  });
  await page.goto("/clients/cc-1/products");
  await expect(page.getByText("CHUVEIRO 8 C/BRACO")).toBeVisible();

  // "Tudo" = 0 meses: histórico inteiro, sem corte.
  await page.getByRole("button", { name: "Tudo" }).click();

  await expect
    .poll(() =>
      spy
        .calls("ClientProductAnalysis")
        .some((variables) => variables.months === 0)
    )
    .toBe(true);
});
