import type { BadgeColor } from "@/components/Badges/Root/interface";

/**
 * Situação do acesso de uma pessoa NESTE escritório, para o gestor ler:
 *
 * - **Convite pendente** — o email já trabalha em outro escritório, então o
 *   cadastro virou convite. A pessoa vê o convite no próximo login (ou pelo
 *   seletor do topo) e precisa aceitar antes de entrar aqui.
 * - **Ativo / Inativo** — o login deste escritório está liberado ou desligado.
 *
 * Convite vem antes de "inativo": quem ainda não aceitou não entrou, e é isso
 * que o gestor precisa saber.
 */
export interface AccessStatus {
  label: string;
  color: BadgeColor;
  /** Explicação para o tooltip — o que o status quer dizer na prática. */
  help: string;
}

export const userAccessStatus = (user: {
  isActive: boolean;
  isInvitationPending?: boolean | null;
}): AccessStatus => {
  if (user.isInvitationPending) {
    return {
      label: "Convite pendente",
      color: "orange",
      help: "Esta pessoa já trabalha em outro escritório, então recebeu um convite. Ela vê o convite no próximo login e precisa aceitar antes de entrar aqui. Até lá, não acessa nada deste escritório.",
    };
  }
  if (user.isActive) {
    return {
      label: "Ativo",
      color: "green",
      help: "O acesso a este escritório está liberado.",
    };
  }
  return {
    label: "Inativo",
    color: "red",
    help: "O acesso a este escritório está desligado. A pessoa não consegue entrar aqui até ser reativada.",
  };
};
