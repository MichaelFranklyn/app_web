/** Linha estruturada do preview (PDF via backend ou planilha lida no browser). */
export interface PreviewItem {
  sku: string;
  name: string | null;
  quantity: string;
  unitPrice: string | null;
  /** Valores "R$" do item (multiline) para o usuário escolher o preço unitário. */
  priceOptions?: string[];
}

export interface ImportTemplateNode {
  id: string;
  factoryId: string;
  target: "ORDER" | "PRICE_LIST";
  fileType: "PDF" | "XLSX" | "CSV";
  parserStrategy: string;
  config: Record<string, unknown>;
  sampleFileUrl: string | null;
  version: number;
  isActive: boolean;
}

export interface ImportTemplatesData {
  importTemplates: {
    edges: { node: ImportTemplateNode }[];
  };
}

export interface ExtractOrderFileResponse {
  extractOrderFile: {
    status: boolean;
    message: string;
    data: {
      fileType: string;
      items: PreviewItem[] | null;
      detectedPreset: string | null;
    } | null;
  };
}

export interface MutationResponse {
  status: boolean;
  message: string;
  data: { id: string } | null;
}
