export interface AccessLinkResult {
  link: string;
  userEmail: string;
  userName: string;
}

export interface IssueAccessLinkData {
  issueTenantAccessLink: {
    status: boolean;
    message: string;
    data: AccessLinkResult | null;
  };
}

/** O mínimo que a janela precisa saber de quem vai receber o link. Aceita
 * tanto uma linha da lista de pessoas da empresa quanto a ficha da pessoa. */
export interface LinkTarget {
  id: string;
  name: string;
}
