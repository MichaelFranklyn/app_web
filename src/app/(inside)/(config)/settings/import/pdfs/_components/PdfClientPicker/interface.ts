export interface PdfClientOptionNode {
  id: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string | null;
  } | null;
}

export interface PdfClientOptionsData {
  pdf_client_options: {
    edges: { node: PdfClientOptionNode }[];
    totalCount: number;
  };
}

/** O cliente escolhido: o que o PDF precisa para entrar. */
export interface PickedClient {
  id: string;
  document: string;
  name: string;
}
