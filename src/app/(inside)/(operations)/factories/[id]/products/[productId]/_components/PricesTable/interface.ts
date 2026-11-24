import { DerivedTierFields } from "../../../../_shared/derivedTier";

export interface PriceList {
  id: string;
  name: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

export interface PriceItem {
  id: string;
  unitPrice: string;
  unitPriceWithImpost: string;
  priceList: PriceList | null;
  /** Com `baseTier`, é calculado: preço vem do base, sem edição à mão. */
  tier: ({ id: string; name: string } & DerivedTierFields) | null;
}

export interface PriceItemsData {
  price_list_items: {
    edges: { node: PriceItem }[];
    totalCount: number;
  };
}

export interface PriceListGroup {
  priceList: PriceList | null;
  items: PriceItem[];
}

export interface PackInfo {
  unitPerPack: number;
  baseUnitLabel: string;
  packLabel: string;
}
