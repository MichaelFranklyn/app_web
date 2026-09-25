import { CreateOrderInput } from "../_shared/orderCreate";
import { FormStepSchema } from "@/components/FormBuilder";
import { CoverageCadence } from "../../_shared/orderCoverage";

/** De onde o novo pedido foi aberto — decide como se escolhe o dono dele. */
export type NewOrderOrigin =
  | { kind: "orders" }
  | { kind: "client"; clientId: string }
  | { kind: "factory"; factoryId: string }
  | {
      kind: "visit";
      visitItemId: string;
      sellerId: string;
      clientId: string;
      factoryId: string;
    };

/** O que cada origem entrega para a página montar o formulário e gravar. */
export interface NewOrderDetails {
  formSteps: FormStepSchema[];
  /** Dados válidos do formulário → input da mutation; null = vínculo sumiu. */
  toInput: (data: Record<string, unknown>) => CreateOrderInput | null;
  /** Nome de quem o pedido é "de" na origem (o cliente), para o cabeçalho. */
  subject?: string | null;
  /** Texto do cabeçalho quando depende do que foi carregado (a visita). */
  description?: string | null;
  /** Valores iniciais do formulário além do padrão ("Pedido"). */
  initialData?: Record<string, unknown>;
}

export interface ClientAssignment {
  id: string;
  sellerId: string;
  factoryId: string;
  isNegative: boolean;
  negativeReason: string | null;
  seller: { id: string; name: string } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  cadence: CoverageCadence | null;
}

export interface ClientAssignmentsData {
  sellerClientFactoryList: {
    edges: { node: ClientAssignment }[];
    totalCount: number;
  };
}
