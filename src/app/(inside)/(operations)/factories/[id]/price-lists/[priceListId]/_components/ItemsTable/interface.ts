// product e tier vêm de loaders e são anuláveis no schema (ex.: tier
// soft-deletado depois que o item foi criado).
export interface PriceListItemRow {
  id: string;
  unitPrice: string;
  unitPriceWithImpost: string;
  product: {
    id: string;
    name: string;
    sku: string;
    isActive: boolean;
    unitPerPack: string;
    unit: { id: string; label: string } | null;
    unitLabel: { id: string; label: string } | null;
  } | null;
  tier: { id: string; name: string } | null;
}

export interface ItemsQueryData {
  price_list_items: {
    edges: { node: PriceListItemRow }[];
    totalCount: number;
  };
}
