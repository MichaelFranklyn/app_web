"use server";

import { gqlFetch } from "@/services/graphql/gqlFetch";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { BillingCycle, StartSubscriptionResult } from "./interface";
import {
  describeStartError,
  extraUsersFor,
  findPlanByCode,
  isSafeInvoiceUrl,
  NO_INVOICE_YET_MESSAGE,
  START_FALLBACK_MESSAGE,
  toApiCycle,
} from "./utils";

const START_SUBSCRIPTION = `
  mutation StartSubscription($input: StartSubscriptionInput!) {
    startSubscription(input: $input) {
      status
      message
      data {
        invoiceUrl
      }
    }
  }
`;

interface StartSubscriptionData {
  startSubscription: {
    status: boolean;
    message: string;
    data: { invoiceUrl: string | null } | null;
  } | null;
}

/**
 * Cria a assinatura da empresa logada e devolve o link da página de pagamento.
 *
 * Server Action, e não Apollo, porque o grupo `(marketing)` não monta o
 * Apollo de propósito (a vitrine fica leve). O token httpOnly é lido aqui no
 * servidor — o navegador nunca o vê.
 *
 * O preço NÃO vai na requisição: só plano, ciclo e usuários a mais. O valor é
 * calculado no backend, senão bastaria editar a chamada para pagar menos.
 */
export async function startSubscriptionAction(
  planCode: string,
  cycle: BillingCycle,
  users: number
): Promise<StartSubscriptionResult> {
  const plan = findPlanByCode(planCode);
  if (!plan || plan.demoMonthlyPrice === null) {
    return { status: "error", message: START_FALLBACK_MESSAGE };
  }

  const token = await getServerCookie<string>("token");
  if (!token) return { status: "login" };

  try {
    const { data } = await gqlFetch<StartSubscriptionData>(
      {
        query: START_SUBSCRIPTION,
        variables: {
          input: {
            plan: plan.code,
            cycle: toApiCycle(cycle),
            extraUsers: extraUsersFor(plan, users),
          },
        },
      },
      token
    );

    const payload = data?.startSubscription;
    if (!payload?.status) {
      return describeStartError(payload?.message ?? "");
    }

    const url = payload.data?.invoiceUrl;
    if (!isSafeInvoiceUrl(url)) {
      return { status: "error", message: NO_INVOICE_YET_MESSAGE };
    }

    return { status: "redirect", url };
  } catch (error) {
    return describeStartError(error instanceof Error ? error.message : "");
  }
}
