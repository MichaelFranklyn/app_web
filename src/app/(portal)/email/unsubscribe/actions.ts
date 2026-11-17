"use server";

import {
  parseUnsubscribeKind,
  requestUnsubscribe,
  UNSUBSCRIBE_COPY,
} from "./utils";

export interface UnsubscribeState {
  status: "idle" | "success" | "error";
  message: string;
}

/**
 * Desliga os emails do `kind` do link (resumos do usuário ou avisos de pedido
 * ao contato do cliente).
 *
 * Server Action atrás de um botão, e NÃO na abertura da página: leitores de
 * email e antivírus abrem os links sozinhos para conferir se são seguros, e um
 * descadastro no GET desligaria os emails de quem nunca clicou.
 *
 * O backend responde 400 para link adulterado, e aí não chega mensagem: o texto
 * de link inválido é o do `kind`.
 */
export async function unsubscribeAction(
  _prevState: UnsubscribeState,
  formData: FormData
): Promise<UnsubscribeState> {
  const kind = parseUnsubscribeKind(String(formData.get("kind") ?? ""));
  const token = String(formData.get("token") ?? "");
  const invalid: UnsubscribeState = {
    status: "error",
    message: UNSUBSCRIBE_COPY[kind].invalidLink,
  };
  if (!token) return invalid;

  const payload = await requestUnsubscribe(kind, token);
  if (!payload?.status) return invalid;
  return { status: "success", message: payload.message };
}
