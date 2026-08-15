"use server";

import { portalFetch } from "@/services/graphql/portalFetch";
import { revalidatePath } from "next/cache";
import { SUBMIT_PORTAL_STOCK } from "../gql";

interface SubmitResponse {
  submitPortalStock: { status: boolean; message: string } | null;
}

export interface StockFormState {
  status: "idle" | "success" | "error";
  message: string;
}

/**
 * Envio do estoque informado pelo cliente.
 *
 * Server Action, e não uma chamada do navegador: assim a requisição ao backend
 * sai do servidor com o token no header, do mesmo jeito que as leituras. Um
 * `fetch` no cliente exigiria expor uma rota que aceitasse o token vindo do
 * JavaScript — mais uma porta para o portal, e a única com poder de ESCREVER.
 *
 * O formulário é nativo (`<form action={...}>`), então continua funcionando
 * enquanto o JavaScript ainda não terminou de carregar — o que numa loja com 4G
 * ruim não é hipótese remota.
 */
export async function submitPortalStockAction(
  _prevState: StockFormState,
  formData: FormData
): Promise<StockFormState> {
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { status: "error", message: "Sessão perdida. Abra o link de novo." };
  }

  const items: Array<{ productId: string; daysRemaining: number }> = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("days__")) continue;

    const raw = String(value).trim();
    // Campo em branco NÃO é zero: o cliente preenche o que sabe, e tratar o
    // vazio como "acabou" transformaria a linha que ele pulou na informação
    // mais urgente da tela.
    if (raw === "") continue;

    const days = Number(raw);
    if (!Number.isFinite(days) || days < 0) continue;

    items.push({
      productId: key.replace("days__", ""),
      daysRemaining: Math.floor(days),
    });
  }

  if (items.length === 0) {
    return {
      status: "error",
      message: "Preencha pelo menos um produto para enviar.",
    };
  }

  const data = await portalFetch<SubmitResponse>(SUBMIT_PORTAL_STOCK, token, {
    input: { items },
  });
  const payload = data?.submitPortalStock;

  if (!payload?.status) {
    return {
      status: "error",
      message:
        payload?.message ?? "Não foi possível enviar agora. Tente de novo.",
    };
  }

  // A própria tela mostra a estimativa que acabou de mudar: sem revalidar, o
  // cliente enviaria "5 dias" e continuaria vendo o número velho ao lado da
  // mensagem de sucesso.
  revalidatePath(`/p/${token}/estoque`);

  return { status: "success", message: payload.message };
}
