"use server";

import { visitResponseFetch } from "@/services/graphql/visitResponseFetch";
import { SUBMIT_VISIT_RESPONSES } from "./gql";
import { buildAnswers } from "./utils";

interface SubmitResponse {
  submitVisitResponses: { status: boolean; message: string } | null;
}

export interface VisitFormState {
  status: "idle" | "success" | "error";
  message: string;
}

/**
 * Envio das respostas do dia.
 *
 * Server Action, e não uma chamada do navegador: assim a requisição sai do
 * servidor com o token no header, do mesmo jeito que a leitura. Um `fetch` no
 * cliente exigiria expor uma rota que aceitasse o token vindo do JavaScript — e
 * esta é a porta com poder de ESCREVER na rotina.
 *
 * O formulário é nativo, então continua funcionando enquanto o JavaScript ainda
 * não carregou — o que num celular no fim do dia, longe do Wi-Fi, não é
 * hipótese remota.
 *
 * Sem `revalidatePath`: revalidar anexa o re-render da rota à resposta da
 * action, e esse stream às vezes não fecha — o botão fica girando e a
 * confirmação nunca aparece. Mesma decisão do formulário de estoque do portal.
 */
export async function submitVisitResponsesAction(
  _prevState: VisitFormState,
  formData: FormData
): Promise<VisitFormState> {
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { status: "error", message: "Sessão perdida. Abra o link de novo." };
  }

  const answers = buildAnswers(formData);
  if (answers.length === 0) {
    return {
      status: "error",
      message: "Escolha o que aconteceu em pelo menos uma visita.",
    };
  }

  const data = await visitResponseFetch<SubmitResponse>(
    SUBMIT_VISIT_RESPONSES,
    token,
    { input: { answers } }
  );
  const payload = data?.submitVisitResponses;

  if (!payload?.status) {
    return {
      status: "error",
      message:
        payload?.message ?? "Não foi possível enviar agora. Tente de novo.",
    };
  }

  return { status: "success", message: payload.message };
}
