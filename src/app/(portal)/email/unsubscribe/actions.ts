"use server";

import { tokenFetch } from "@/services/graphql/tokenFetch";
import { UNSUBSCRIBE_EMAIL_DIGEST } from "./gql";

interface UnsubscribeResponse {
  unsubscribeEmailDigest: { status: boolean; message: string } | null;
}

export interface UnsubscribeState {
  status: "idle" | "success" | "error";
  message: string;
}

/** O backend responde 400 para link adulterado, e aí não chega mensagem. */
const INVALID_LINK_MESSAGE =
  "Este link não é válido. Para parar de receber os emails, entre no Itinus e desligue a opção em Meu perfil.";

/**
 * Desliga os resumos por email.
 *
 * Server Action atrás de um botão, e NÃO na abertura da página: leitores de
 * email e antivírus abrem os links sozinhos para conferir se são seguros, e um
 * descadastro no GET desligaria os emails de quem nunca clicou.
 */
export async function unsubscribeAction(
  _prevState: UnsubscribeState,
  formData: FormData
): Promise<UnsubscribeState> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { status: "error", message: INVALID_LINK_MESSAGE };

  const data = await tokenFetch<UnsubscribeResponse>(
    UNSUBSCRIBE_EMAIL_DIGEST,
    null,
    { token }
  );
  const payload = data?.unsubscribeEmailDigest;

  if (!payload?.status) {
    return { status: "error", message: INVALID_LINK_MESSAGE };
  }
  return { status: "success", message: payload.message };
}
