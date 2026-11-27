import { LucideIcon } from "lucide-react";

/** Enum `CompanySetupStepKey` do backend, pelo NOME. */
export type SetupStepKey =
  | "SELLERS"
  | "FACTORIES"
  | "PRICE_LISTS"
  | "CLIENTS"
  | "ORDER_HISTORY";

export interface SetupStep {
  key: SetupStepKey;
  isDone: boolean;
  isRequired: boolean;
}

export interface SetupFactory {
  companyFactoryId: string;
  factoryId: string;
  name: string;
  paymentTermsCount: number;
  sellersCount: number;
  hasPriceList: boolean;
  isConfigured: boolean;
}

export interface CompanySetupProgress {
  isCompleted: boolean;
  completedAt: string | null;
  canComplete: boolean;
  doneStepsCount: number;
  sellersCount: number;
  clientsCount: number;
  historyBatchesCount: number;
  historyOrdersCount: number;
  pendingAccessEmailsCount: number;
  factories: SetupFactory[];
  steps: SetupStep[];
}

interface ProgressPayload {
  status: boolean;
  message: string;
  data: CompanySetupProgress | null;
}

export interface CompanySetupProgressResponse {
  companySetupProgress: ProgressPayload;
}

export interface CompleteCompanySetupResponse {
  completeCompanySetup: ProgressPayload;
}

/** O texto fixo de um passo — o que muda com os dados vem do progresso. */
export interface SetupStepContent {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  action: string;
}

/** O pé em que o pedido estava no sistema antigo (`HistoryOrderStatus`). */
export type HistoryOrderStatus =
  | "CONFIRMED"
  | "SENT_TO_FACTORY"
  | "INVOICED"
  | "DELIVERED"
  | "CANCELLED";

export type QuantityUnit = "UNITS" | "PACKS";

/** Uma opção para casar com o valor da planilha (fábrica, vendedor). */
export interface MatchOption {
  id: string;
  label: string;
}

/** Linha pronta para a mutation (espelha `ImportOrderHistoryRowInput`). */
export interface HistoryRowInput {
  row: number;
  externalRef: string | null;
  clientDocument: string;
  factoryId: string;
  sellerId: string;
  orderDate: string;
  productCode: string | null;
  productName: string | null;
  quantity: string;
  unitPrice: string | null;
  total: string | null;
  status: HistoryOrderStatus;
  clientName: string | null;
  invoiceNumber: string | null;
  invoicedAt: string | null;
  paymentTerms: string | null;
  /** Observações do pedido; basta numa linha do pedido. */
  notes?: string | null;
  /** Cria o cliente que falta só para este pedido (escolha da prévia do PDF). */
  createClient?: boolean;
  /** O código do cliente na fábrica, gravado no vínculo quando estiver livre. */
  factoryClientCode?: string | null;
}

export interface RowProblem {
  row: number;
  message: string;
  /** A linha com que esta conflita (onde o mesmo pedido apareceu antes). */
  relatedRow?: number | null;
}

interface HistoryFactory {
  id: string;
  nomeFantasia: string | null;
  razaoSocial: string;
  nickname: string | null;
}

export interface HistoryResult {
  dryRun: boolean;
  /** Lote da importação de verdade; nulo na prévia. */
  batchId?: string | null;
  totalRows: number;
  ordersCreated: number;
  ordersAlreadyImported: number;
  ordersSkipped: number;
  itemsImported: number;
  itemsSkipped: number;
  linksCreated: number;
  clientsCreated: number;
  productsCreated: number;
  /** Fábricas liberadas a vendedores que ainda não as atendiam. */
  sellerAccessesGranted: number;
  /** Parcelas a vencer criadas nos faturados e entregues. */
  installmentsCreated: number;
  issues: RowProblem[];
  missingProducts: {
    factoryId: string;
    factory: HistoryFactory | null;
    code: string | null;
    name: string | null;
    rows: number;
    /** Valor dessas linhas na planilha (Decimal do servidor, em texto). */
    amount: string;
  }[];
  missingClients: { document: string; rows: number }[];
  /** Vendedor × fábrica sem acesso: o pedido entra, o cliente fica fora da rotina. */
  missingSellerAccess: {
    sellerId: string;
    seller: { id: string; name: string } | null;
    factoryId: string;
    factory: HistoryFactory | null;
    orders: number;
  }[];
  /** Prazos que a importação cadastra na fábrica (vieram no pedido, ela não tinha). */
  newPaymentTerms: {
    factoryId: string;
    factory: HistoryFactory | null;
    name: string;
  }[];
}

export interface ImportOrderHistoryResponse {
  importOrderHistory: {
    status: boolean;
    message: string;
    data: HistoryResult | null;
  };
}

export interface HistoryImportBatch {
  id: string;
  createdAt: string;
  createdByEmail: string | null;
  ordersCount: number;
  itemsCount: number;
  undoneAt: string | null;
  undoneByEmail: string | null;
  undoReason: string | null;
  ordersUndone: number;
  /** Clientes novos do lote que o desfazer tirou da carteira. */
  clientsUndone: number;
  /** Clientes que esta importação pôs na carteira e continuam nela. */
  clientsCount: number;
}

export interface HistoryImportBatchesResponse {
  orderHistoryImportBatches: HistoryImportBatch[];
}

export interface UndoHistoryImportResponse {
  undoOrderHistoryImport: {
    status: boolean;
    message: string;
    data: Pick<HistoryImportBatch, "id" | "clientsUndone"> | null;
  };
}
