// SSOT (Single Source of Truth): Import ALL types from parent route
import {
  CreateSellerClientFactoryResponse,
  SellerClientFactoriesQueryResponse,
  SellerClientFactory,
  UpdateSellerClientFactoryResponse,
} from "../interface";

// Type alias for factories context clarity
export type SellerClientFactoryNode = SellerClientFactory;

// Re-export parent types
export type {
  CreateSellerClientFactoryResponse,
  SellerClientFactoriesQueryResponse,
  UpdateSellerClientFactoryResponse,
};
