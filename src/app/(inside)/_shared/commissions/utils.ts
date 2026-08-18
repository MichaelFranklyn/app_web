import { factoryName } from "@/utils/company";

/**
 * Vocabulário e agrupamento da parcela de comissão — o que a tela de Comissões e
 * o relatório de comissões precisam falar igual.
 *
 * Mora no pai comum das duas rotas: a situação de uma parcela não pode se chamar
 * "A receber" numa tela e "Pendente" na outra, e a fábrica não pode aparecer
 * agrupada de um jeito no papel e de outro na tela. O resto do cálculo de
 * comissão (as abas, o relatório do repasse) continua na página, que é a única
 * que o usa.
 */

export type CommissionStatus =
  | "pending"
  | "receivable"
  | "received"
  | "cancelled"
  /** Calote depois de a comissão ter sido paga: valor negativo, a devolver. */
  | "chargeback";

export const COMMISSION_STATUS_LABEL: Record<CommissionStatus, string> = {
  pending: "Previsto",
  receivable: "A receber",
  received: "Recebido",
  cancelled: "Cancelado",
  chargeback: "Estorno",
};

export const COMMISSION_STATUS_TONE: Record<
  CommissionStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  pending: "neutral",
  receivable: "amber",
  received: "green",
  cancelled: "red",
  chargeback: "red",
};

/** O mínimo que o agrupamento por fábrica precisa saber de uma linha. */
interface HasFactory {
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface FactoryGroup<T> {
  factoryId: string;
  name: string;
  rows: T[];
}

const FACTORYLESS_ID = "__sem_fabrica__";

/**
 * Agrupa as linhas por fábrica trabalhada — é assim que a fábrica manda a
 * planilha, então bater o olho fica direto. Recebe as linhas JÁ recortadas pelos
 * filtros de quem chama; fábrica sem linha simplesmente não vira grupo. Ordena
 * por nome da fábrica (pt-BR).
 */
export const groupByFactory = <T extends HasFactory>(
  rows: T[]
): FactoryGroup<T>[] => {
  const byId = new Map<string, FactoryGroup<T>>();

  for (const row of rows) {
    const id = row.factory?.id ?? FACTORYLESS_ID;
    let group = byId.get(id);
    if (!group) {
      group = { factoryId: id, name: factoryName(row.factory), rows: [] };
      byId.set(id, group);
    }
    group.rows.push(row);
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );
};

/**
 * De onde contam os dias do boleto numa fábrica.
 *
 * Mora aqui, e não na tela de fábricas, porque duas rotas distantes precisam
 * dizer a mesma coisa: o cadastro do contrato (onde se escolhe) e o detalhe do
 * pedido (onde o vencimento é conferido). Não é a mesma pergunta que a base de
 * cálculo da comissão — aquela é sobre quando a FÁBRICA paga o representante;
 * esta é sobre o vencimento que o CLIENTE recebe: "30/60/90 dias" conta da nota
 * fiscal numa fábrica e da data da compra em outra.
 *
 * Nulo no banco = Faturamento, que é o que vale para todos os vínculos
 * anteriores ao campo.
 */
export const INSTALLMENT_DUE_BASIS_OPTIONS = [
  { value: "Faturamento", label: "Faturamento — conta da nota fiscal" },
  { value: "Pedido", label: "Pedido — conta da data da compra" },
];

export const installmentDueBasisLabel = (
  basis: string | null | undefined
): string =>
  basis && basis.toLowerCase().startsWith("pedido")
    ? "da data do pedido"
    : "do faturamento";

/**
 * Modo Pagamento: a fábrica paga a comissão conforme o cliente paga os boletos.
 *
 * Espelha `is_payment_basis` do backend — inclusive em NÃO aceitar o rótulo
 * antigo "Pedido", que hoje é o texto da base do VENCIMENTO
 * (`installmentDueBasis`) e significa outra coisa. As duas leituras não podem
 * divergir: o modo decide toda a régua da comissão.
 */
export const isPaymentBasis = (basis: string | null | undefined): boolean => {
  if (!basis) return false;
  const norm = basis
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return norm.startsWith("pag");
};

export const commissionModeLabel = (
  basis: string | null | undefined
): string => (isPaymentBasis(basis) ? "Pagamento" : "Faturamento");
