"use server";

import { portalFetch } from "@/services/graphql/portalFetch";
import { REQUEST_PORTAL_QUOTE } from "../gql";
import { pickedEntries } from "../utils";
import { OrderFormState } from "./interface";
import { orderRequestFields, sentOrderRedirect } from "./utils";

interface RequestResponse {
  requestPortalQuote: {
    status: boolean;
    message: string;
    data: { orderIds: string[] } | null;
  } | null;
}

/**
 * O cliente manda a lista dele ao representante.
 *
 * Uma mutação só para os dois caminhos (o que está acabando e o catálogo):
 * as duas viravam o mesmo rascunho por vendedor × fábrica, e a do orçamento
 * já aceita o recado. A quantidade chega encaixada na embalagem mínima (a
 * tela confere), e o servidor arredonda de novo para cima por garantia.
 *
 * Server Action (o token não passa pelo JavaScript do navegador) e SEM
 * `revalidatePath`. Deu certo, a resposta diz PARA ONDE ir — a tela do pedido
 * enviado —, e quem navega é o cliente: ele ainda precisa esvaziar a lista,
 * que mora no navegador.
 */
export async function requestOrderAction(
  _prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { status: "error", message: "Sessão perdida. Abra o link de novo." };
  }

  const items = pickedEntries(formData);
  if (items.length === 0) {
    return {
      status: "error",
      message: "Sua lista está vazia ou sem quantidade. Diga quanto quer.",
    };
  }

  const data = await portalFetch<RequestResponse>(REQUEST_PORTAL_QUOTE, token, {
    input: { items, ...orderRequestFields(formData) },
  });
  const payload = data?.requestPortalQuote;

  if (!payload?.status) {
    return {
      status: "error",
      message:
        payload?.message ?? "Não foi possível enviar agora. Tente de novo.",
    };
  }

  return {
    status: "success",
    message: payload.message,
    submission: Date.now(),
    redirectTo: sentOrderRedirect(token, payload.data?.orderIds ?? []),
  };
}
