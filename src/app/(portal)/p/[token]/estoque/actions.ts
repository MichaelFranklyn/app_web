"use server";

import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_STOCK, SUBMIT_PORTAL_STOCK } from "../gql";
import { PortalStockData, PortalStockItem } from "../interface";
import { sortStockByUrgency } from "../utils";

interface SubmitResponse {
  submitPortalStock: { status: boolean; message: string } | null;
}

export interface StockFormState {
  status: "idle" | "success" | "error";
  message: string;
  /**
   * A lista relida DEPOIS do envio, para a tela mostrar a estimativa nova ao
   * lado do "obrigado". Vem junto da resposta da action de propósito — ver o
   * comentário no fim da função.
   */
  items?: PortalStockItem[];
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

  // A própria tela mostra a estimativa que acabou de mudar: sem isto, o cliente
  // enviaria "5 dias" e continuaria vendo o número velho ao lado da mensagem de
  // sucesso.
  //
  // A lista nova vem RELIDA aqui, e não de um `revalidatePath`. Revalidar faz o
  // Next anexar o re-render da rota à resposta da action, e esse stream às vezes
  // não fecha quando há requisições concorrentes na mesma rota (medido em
  // 22/08/2026, Next 16.2.10: 7 travadas em 205 envios; zero em 246 sem ele).
  // Quando trava, o `useActionState` nunca resolve: o botão fica girando e a
  // confirmação nunca aparece — para o cliente, o envio simplesmente não termina.
  //
  // Se a releitura falhar, o envio continua tendo dado certo: a tela mantém a
  // lista que já estava na mão e mostra a confirmação assim mesmo.
  const fresh = await portalFetch<PortalStockData>(PORTAL_STOCK, token);
  const freshItems = fresh?.portalStock?.data;

  return {
    status: "success",
    message: payload.message,
    ...(freshItems ? { items: sortStockByUrgency(freshItems) } : {}),
  };
}
