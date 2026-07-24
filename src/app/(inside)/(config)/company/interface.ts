export interface MyCompany {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  segment: string;
  // Contato da empresa (o e-mail é do usuário, não da empresa — fica de fora).
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  // Endereço completo (usado em documentos/PDF).
  addressZip: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  /** Marca completa (com o nome): cabeçalho do PDF do pedido. */
  logoUrl: string | null;
  /** Símbolo quadrado: avatar no topo do sistema. Sem ele, cai para a logo. */
  avatarUrl: string | null;
}

export interface MyCompanyQueryData {
  my_company: {
    status: boolean;
    message: string;
    data: MyCompany | null;
  };
}

export interface UpdateCompanyResponse {
  updateCompany: {
    status: boolean;
    message: string;
    data: MyCompany | null;
  };
}

/** Campos aceitos por `updateCompany` (o CNPJ e a razão social vêm da Receita). */
export interface UpdateCompanyInput {
  segment?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  addressZip?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  logoBase64?: string;
  logoFileName?: string | null;
  avatarBase64?: string;
  avatarFileName?: string | null;
}
