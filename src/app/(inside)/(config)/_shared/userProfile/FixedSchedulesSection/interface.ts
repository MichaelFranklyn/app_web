export interface FixedScheduleClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
}

export interface FixedScheduleNode {
  id: string;
  clientId: string;
  /** ISO weekday: 1 = segunda .. 7 = domingo. */
  weekday: number;
  /** Cadência em semanas: 1 = toda semana, 2 = quinzenal, 4 = mensal. */
  intervalWeeks: number;
  startsOn: string;
  endsOn: string | null;
  isActive: boolean;
  notes: string | null;
  /** Próximas datas em que o compromisso cai — calculadas pelo backend. */
  nextOccurrences: string[];
  client: FixedScheduleClient | null;
}

export interface FixedSchedulesQueryData {
  fixedSchedules: {
    edges: { node: FixedScheduleNode }[];
    totalCount: number;
  };
}

interface MutationResult {
  status: boolean;
  message: string;
  data: FixedScheduleNode | null;
}

export interface CreateFixedScheduleResponse {
  createFixedSchedule: MutationResult;
}

export interface UpdateFixedScheduleResponse {
  updateFixedSchedule: MutationResult;
}

export interface DeleteFixedScheduleResponse {
  deleteFixedSchedule: MutationResult;
}

/** Cliente da carteira do vendedor, para o select do modal. */
export interface WalletClientOption {
  clientId: string;
  label: string;
}
