export type PlatformStaffRole = "SU" | "SUPPORT";

export interface PlatformStaffMember {
  id: string;
  name: string;
  email: string;
  role: PlatformStaffRole;
  /** Falso = login recusado. É a revogação de acesso de quem saiu do time. */
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /**
   * Empresa a que a conta está amarrada porque `users.company_id` é NOT NULL.
   * NÃO limita o que a pessoa enxerga — a tela mostra o nome só para ninguém
   * concluir que a conta pertence àquela empresa.
   */
  anchorCompanyName: string;
}

export interface StaffQueryData {
  platformStaff: { data: PlatformStaffMember[] | null };
}

export interface CreatedPlatformUser {
  userId: string;
  name: string;
  email: string;
  role: PlatformStaffRole;
  /** Aparece UMA vez, na resposta da criação: não há e-mail, então quem criou a
   * conta precisa repassá-lo. */
  link: string;
}

export interface TeamContentProps {
  seed: StaffQueryData | null;
}
