export type UserRole = "SU" | "OWNER" | "ADMIN" | "SELLER";

/** Resumo da rotina — o que o card do perfil exibe e edita. */
export interface ProfileScheduleConfig {
  id: string;
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  avgVisitDurationMin: number;
  isRescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
}

/**
 * Perfil de vendedor: existe só para quem opera em campo. Nome, telefone, CPF e
 * endereço são da PESSOA e vêm em `UserDetail` — aqui fica o que só existe
 * porque ela vende. `name` é projeção de `user.name` no backend.
 */
export interface ProfileSeller {
  id: string;
  name: string;
  region: string | null;
  isActive: boolean;
  factoryCount: number;
  clientCount: number;
  totalRevenue: string;
  lastOrderDate: string | null;
  scheduleConfig: ProfileScheduleConfig | null;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone: string | null;
  cpf: string | null;
  birthDate: string | null;
  addressZip: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  createdAt: string;
  company: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  seller: ProfileSeller | null;
}

export interface UserDetailQueryResponse {
  user_detail: {
    status: boolean;
    message: string;
    data: UserDetail | null;
  };
}
