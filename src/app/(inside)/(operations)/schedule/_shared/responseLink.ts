import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

/**
 * Link com que o vendedor responde a rotina pelo celular (`/r/[token]`) — o
 * mesmo do QR da folha impressa. Existe para o DIA (rota do dia) e para a
 * SEMANA (rotina da semana); cada emissão sorteia um endereço novo e derruba o
 * anterior do mesmo recorte. O token em claro só existe no retorno.
 *
 * Compartilhado pela rota do dia e pela rotina da semana: a impressão (QR) e o
 * botão "Link de resposta" das duas telas emitem por aqui.
 */
export type ResponseLinkScope =
  | { kind: "day"; scheduleDayId: string }
  | { kind: "week"; scheduleId: string };

export interface IssuedResponseLink {
  url: string;
  expiresAt: string;
}

interface IssuePayload {
  status: boolean;
  message: string;
  data: IssuedResponseLink | null;
}

export const ISSUE_VISIT_RESPONSE_LINK_MUTATION = gql`
  mutation IssueVisitResponseLink($scheduleDayId: UUID!) {
    issueVisitResponseLink(scheduleDayId: $scheduleDayId) {
      status
      message
      data {
        url
        expiresAt
      }
    }
  }
`;

export const ISSUE_WEEK_RESPONSE_LINK_MUTATION = gql`
  mutation IssueWeekResponseLink($scheduleId: UUID!) {
    issueWeekResponseLink(scheduleId: $scheduleId) {
      status
      message
      data {
        url
        expiresAt
      }
    }
  }
`;

/**
 * Emite o link do recorte. Lança com a mensagem do backend quando ele recusa —
 * quem imprime pega o erro e segue sem o QR; o modal mostra o toast.
 */
export function useIssueResponseLink(scope: ResponseLinkScope) {
  const [issueDay] = useMutation<{
    issueVisitResponseLink: IssuePayload | null;
  }>(ISSUE_VISIT_RESPONSE_LINK_MUTATION);
  const [issueWeek] = useMutation<{
    issueWeekResponseLink: IssuePayload | null;
  }>(ISSUE_WEEK_RESPONSE_LINK_MUTATION);

  return async (): Promise<IssuedResponseLink> => {
    const payload =
      scope.kind === "day"
        ? (
            await issueDay({
              variables: { scheduleDayId: scope.scheduleDayId },
            })
          ).data?.issueVisitResponseLink
        : (await issueWeek({ variables: { scheduleId: scope.scheduleId } }))
            .data?.issueWeekResponseLink;
    if (!payload?.status || !payload.data?.url) {
      throw new Error(payload?.message ?? "Erro ao gerar o link");
    }
    return payload.data;
  };
}
