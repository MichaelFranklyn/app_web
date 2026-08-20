// SSOT (Single Source of Truth): Import ALL types from parent route
import {
  ClientDetail,
  CreateSellerClientFactoryResponse,
  SellerClientFactoriesQueryResponse,
  UpdateAddressResponse,
  UpdateClientNotesResponse,
  UpdateSellerClientFactoryResponse,
} from "../interface";

// Type aliases for overview context clarity
export type ClientData = ClientDetail;

// Re-export parent types
export type {
  CreateSellerClientFactoryResponse,
  SellerClientFactoriesQueryResponse,
  UpdateAddressResponse,
  UpdateClientNotesResponse,
  UpdateSellerClientFactoryResponse,
};
