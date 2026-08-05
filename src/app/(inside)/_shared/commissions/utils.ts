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
  | "cancelled";

export const COMMISSION_STATUS_LABEL: Record<CommissionStatus, string> = {
  pending: "Previsto",
  receivable: "A receber",
  received: "Recebido",
  cancelled: "Cancelado",
};

export const COMMISSION_STATUS_TONE: Record<
  CommissionStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  pending: "neutral",
  receivable: "amber",
  received: "green",
  cancelled: "red",
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
