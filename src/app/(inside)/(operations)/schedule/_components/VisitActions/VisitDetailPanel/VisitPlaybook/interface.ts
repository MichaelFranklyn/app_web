import { ProductPurchaseStatus } from "@/utils/productPurchase";

interface PlaybookProduct {
  id: string;
  name: string;
}

export interface PlaybookOffer {
  productId: string;
  status: ProductPurchaseStatus;
  orderCount: number;
  factoryOrderCount: number;
  daysSinceLast: number;
  lastUnits: string;
  isPromo: boolean;
  product: PlaybookProduct | null;
}

export interface PlaybookPromotion {
  endsOn: string;
  productCount: number;
  products: {
    productId: string;
    discountPercent: number;
    isBoughtByClient: boolean;
    product: PlaybookProduct | null;
  }[];
}

export interface PlaybookFactory {
  sellerClientFactoryId: string;
  isFocus: boolean;
  isNegative: boolean;
  moreOffersCount: number;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
  offers: PlaybookOffer[];
  promotion: PlaybookPromotion | null;
  portalRequest: { orderId: string; requestedOn: string } | null;
}

export interface VisitPlaybookData {
  visitPlaybook: {
    companyClientId: string | null;
    factories: PlaybookFactory[];
  };
}
