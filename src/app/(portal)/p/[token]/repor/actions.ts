"use server";

import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_REPLENISHMENT, REQUEST_PORTAL_REPLENISHMENT } from "../gql";
import { PortalReplenishmentData, PortalReplenishmentItem } from "../interface";
import { pickedEntries } from "./utils";

interface RequestResponse {
  requestPortalReplenishment: { status: boolean; message: string } | null;
}

export interface ReplenishFormState {
  status: "idle" | "success" | "error";
  message: string;
  /** A lista relida depois do envio — com o "já pedido" de cada produto. */
  items?: PortalReplenishmentItem[];
  /** Muda a cada envio que deu certo: a tela remonta e desmarca tudo. */
  submission?: number;
}

/**
 * O cliente pede reposição.
 *
 * Mesmo molde de `estoque/actions.ts`, pelos mesmos motivos: Server Action
 * (o token sai do servidor, nunca do JavaScript do navegador), formulário
 * nativo (funciona antes de o JS carregar) e SEM `revalidatePath` — a lista
 * nova é relida aqui e volta junto da resposta (ver o comentário lá sobre o
 * stream que não fecha).
 */
export async function requestReplenishmentAction(
  _prevState: ReplenishFormState,
  formData: FormData
): Promise<ReplenishFormState> {
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { status: "error", message: "Sessão perdida. Abra o link de novo." };
  }

  const items = pickedEntries(formData);
  if (items.length === 0) {
    return {
      status: "error",
      message: "Marque pelo menos um produto e diga quanto quer.",
    };
  }

  const data = await portalFetch<RequestResponse>(
    REQUEST_PORTAL_REPLENISHMENT,
    token,
    { input: { items } }
  );
  const payload = data?.requestPortalReplenishment;

  if (!payload?.status) {
    return {
      status: "error",
      message:
        payload?.message ?? "Não foi possível enviar agora. Tente de novo.",
    };
  }

  const fresh = await portalFetch<PortalReplenishmentData>(
    PORTAL_REPLENISHMENT,
    token
  );
  const freshItems = fresh?.portalReplenishment?.data?.items;

  return {
    status: "success",
    message: payload.message,
    submission: Date.now(),
    ...(freshItems ? { items: freshItems } : {}),
  };
}
