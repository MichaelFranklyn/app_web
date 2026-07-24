export interface UserMenuProps {
  name: string;
  role?: string;
  initials?: string;
  /** Dono da conta: exibe o atalho "Dados da empresa" (rota @is_owner). */
  canManageCompany?: boolean;
}
