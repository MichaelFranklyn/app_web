/** O pacote que o backend entrega para a ficha (query `orderSheetPackage`). */

export interface SheetPaymentTerm {
  id: string;
  name: string;
  installmentsDays: number[];
  minOrderAmount: string | null;
}

export interface SheetTier {
  id: string;
  name: string;
}

export interface SheetFactory {
  id: string;
  companyFactoryId: string;
  name: string;
  ipiInOrder: boolean;
  deliveryEstimateDays: number | null;
  minOrderAmount: string | null;
  freeFreightCifAmount: string | null;
  paymentTerms: SheetPaymentTerm[];
  tiers: SheetTier[];
  priceListIds: string[];
}

export interface SheetClient {
  id: string;
  cnpj: string;
  cnpjDigits: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressNeighborhood: string | null;
  addressZip: string | null;
  addressCity: string | null;
  addressState: string | null;
}

export interface SheetLink {
  clientId: string;
  factoryId: string;
  tierId: string | null;
  tierName: string | null;
}

export interface SheetPrice {
  tierId: string;
  tierName: string | null;
  packPrice: string;
  unitPrice: string;
  isPromo: boolean;
  promoEndsOn: string | null;
}

export interface SheetProduct {
  id: string;
  factoryId: string;
  sku: string;
  name: string;
  unitLabel: string | null;
  unitPerPack: string;
  saleMultiple: string | null;
  ncm: string | null;
  taxRate: string;
  ipiRate: string;
  prices: SheetPrice[];
}

export interface OrderSheetPackage {
  generatedAt: string;
  formatVersion: number;
  companyId: string;
  seller: { id: string; name: string };
  factories: SheetFactory[];
  clients: SheetClient[];
  links: SheetLink[];
  products: SheetProduct[];
}

/** Cabeçalho já preenchido — o botão da tela do cliente manda o cliente dele. */
export interface OrderSheetPreset {
  cnpjDigits?: string;
  factoryName?: string;
}

/** Imagem já decodificada, no formato que o PDF do sistema também usa. */
export interface SheetImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * As marcas do topo da ficha. Tudo opcional: a ficha existe mesmo quando a
 * empresa não subiu logo ou a imagem não carregou.
 */
export interface OrderSheetBrand {
  companyLogo?: SheetImage | null;
  companyName?: string | null;
  girusLogo?: SheetImage | null;
}
