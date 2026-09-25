import type { ThemeColor } from "@/lib/theme";
import { WalletStatus } from "./interface";

/**
 * Como cada situação aparece na tela. Frases de quem usa, não termos de
 * cadastro: "Não existe mais" diz o que aconteceu; "Encerrado" obrigaria a
 * perguntar "encerrado por quê?".
 */
export const WALLET_STATUS_LABEL: Record<WalletStatus, string> = {
  ACTIVE: "Ativo",
  CLOSED: "Não existe mais",
  ENDED: "Não trabalhamos mais",
  SUCCEEDED: "Mudou de CNPJ",
};

export const WALLET_STATUS_COLOR: Record<WalletStatus, ThemeColor> = {
  ACTIVE: "green",
  CLOSED: "red",
  ENDED: "neutral",
  SUCCEEDED: "blue",
};

export const walletStatusLabel = (status: string | null | undefined): string =>
  WALLET_STATUS_LABEL[(status ?? "ACTIVE") as WalletStatus] ?? "Ativo";

export const isWalletActive = (status: string | null | undefined): boolean =>
  (status ?? "ACTIVE") === "ACTIVE";

/** Rótulo do campo que a Receita mudou, para a mensagem de retorno. */
const CHANGE_LABEL: Record<string, string> = {
  razaoSocial: "Razão social",
  nomeFantasia: "Nome fantasia",
};

/**
 * O que a Receita trouxe de novo, numa frase. Sem mudança, diz isso — o
 * usuário clicou para saber, e "atualizado" sem dizer o quê não responde.
 */
export const describeReceitaChanges = (
  changes: { field: string; before: string | null; after: string | null }[]
): string =>
  changes.length === 0
    ? "Conferido na Receita: o nome já estava atualizado."
    : changes
        .map(
          (c) =>
            `${CHANGE_LABEL[c.field] ?? c.field}: "${c.before ?? "—"}" → "${c.after ?? "—"}"`
        )
        .join(" · ");
