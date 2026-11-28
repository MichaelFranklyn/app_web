export interface PdfClientFactoryCodeData {
  sellerClientFactoryList: {
    edges: { node: { id: string; factoryClientCode: string | null } }[];
  };
}
