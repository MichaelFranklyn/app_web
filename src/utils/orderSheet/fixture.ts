/** Pacote mínimo com as duas fábricas do banco de teste, para os testes da ficha. */

import type { OrderSheetPackage } from "./interface";

export const sheetPackageFixture = (
  overrides: Partial<OrderSheetPackage> = {}
): OrderSheetPackage => ({
  generatedAt: "2026-09-02",
  formatVersion: 1,
  companyId: "company-1",
  seller: { id: "seller-1", name: "Rafael" },
  factories: [
    {
      id: "factory-herc",
      companyFactoryId: "cf-herc",
      name: "HERC",
      ipiInOrder: false,
      deliveryEstimateDays: 15,
      minOrderAmount: null,
      freeFreightCifAmount: null,
      paymentTerms: [
        {
          id: "t1",
          name: "30/45/60",
          installmentsDays: [30, 45, 60],
          minOrderAmount: null,
        },
        {
          id: "t2",
          name: "30/60/90",
          installmentsDays: [30, 60, 90],
          minOrderAmount: null,
        },
      ],
      tiers: [{ id: "tier-platina", name: "Platina" }],
      priceListIds: ["list-herc"],
    },
    {
      id: "factory-silvana",
      companyFactoryId: "cf-silvana",
      name: "Silvana",
      ipiInOrder: true,
      deliveryEstimateDays: null,
      minOrderAmount: null,
      freeFreightCifAmount: null,
      paymentTerms: [
        {
          id: "t3",
          name: "28/42/56",
          installmentsDays: [28, 42, 56],
          minOrderAmount: null,
        },
      ],
      tiers: [{ id: "tier-diamante", name: "Diamante" }],
      priceListIds: ["list-silvana"],
    },
  ],
  clients: [
    {
      id: "client-1",
      cnpj: "51909936000170",
      cnpjDigits: "51909936000170",
      razaoSocial: "ALTO CONSTRUCAO LTDA",
      nomeFantasia: "Alto",
      addressStreet: "24 DE JUNHO",
      addressNumber: "10",
      addressNeighborhood: "Centro",
      addressZip: "40000-000",
      addressCity: "Salvador",
      addressState: "BA",
    },
  ],
  links: [
    {
      clientId: "client-1",
      factoryId: "factory-herc",
      tierId: "tier-platina",
      tierName: "Platina",
    },
  ],
  products: [
    {
      id: "product-1",
      factoryId: "factory-herc",
      sku: "1000000011",
      name: "ENGATE FLEXIVEL 60CM",
      unitLabel: "Caixa",
      unitPerPack: "12.0000",
      saleMultiple: null,
      ncm: "39172900",
      taxRate: "5.2000",
      ipiRate: "0",
      prices: [
        {
          tierId: "tier-platina",
          tierName: "Platina",
          packPrice: "89.5200",
          unitPrice: "7.4600",
          isPromo: false,
          promoEndsOn: null,
        },
      ],
    },
    {
      id: "product-2",
      factoryId: "factory-silvana",
      sku: "90281",
      name: "PURIFICADOR DE MESA",
      unitLabel: "Unidade",
      unitPerPack: "1.0000",
      saleMultiple: "6",
      ncm: null,
      taxRate: "0",
      ipiRate: "7.5000",
      prices: [
        {
          tierId: "tier-diamante",
          tierName: "Diamante",
          packPrice: "67.5700",
          unitPrice: "67.5700",
          isPromo: false,
          promoEndsOn: null,
        },
      ],
    },
  ],
  ...overrides,
});
