"use server";

import { portalFetch } from "@/services/graphql/portalFetch";
import { CONFIRM_PORTAL_ORDER_DELIVERY } from "../../gql";

interface ConfirmResponse {
  confirmPortalOrderDelivery: { status: boolean; message: string } | null;
}

export interface ConfirmDeliveryResult {
  ok: boolean;
  message: string;
}

/**
 * O cliente avisa que o pedido chegou. Server Action pelo mesmo motivo do
 * envio de estoque: o token vai do servidor ao backend, nunca do navegador.
 *
 * Sem `revalidatePath` (trava o stream da action — ver `estoque/actions.ts`):
 * quem chama faz `router.refresh()` depois do sucesso.
 */
export async function confirmPortalOrderDeliveryAction(
  token: string,
  orderId: string,
  deliveredAt: string | null
): Promise<ConfirmDeliveryResult> {
  if (!token)
    return { ok: false, message: "Sessão perdida. Abra o link de novo." };

  const data = await portalFetch<ConfirmResponse>(
    CONFIRM_PORTAL_ORDER_DELIVERY,
    token,
    { id: orderId, deliveredAt }
  );
  const payload = data?.confirmPortalOrderDelivery;
  if (!payload?.status) {
    return {
      ok: false,
      message:
        payload?.message ?? "Não foi possível confirmar agora. Tente de novo.",
    };
  }
  return { ok: true, message: payload.message };
}
