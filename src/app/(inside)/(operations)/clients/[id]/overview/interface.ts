// SSOT (Single Source of Truth): Import ALL types from parent route
import {
  ClientDetail,
  ClientDetailQueryResponse,
  CreateSellerClientFactoryResponse,
  SellerClientFactoriesQueryResponse,
  SellerClientFactory,
  UpdateAddressResponse,
  UpdateClientNotesResponse,
  UpdateSellerClientFactoryResponse,
} from "../interface";

// Type aliases for overview context clarity
export type ClientData = ClientDetail;
export type SellerClientFactoryNode = SellerClientFactory;

// Re-export parent types
export type {
  ClientDetailQueryResponse,
  CreateSellerClientFactoryResponse,
  SellerClientFactoriesQueryResponse,
  UpdateAddressResponse,
  UpdateClientNotesResponse,
  UpdateSellerClientFactoryResponse,
};
