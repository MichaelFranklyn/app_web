"use client";

import { useQuery } from "@apollo/client/react";

import { MY_PLAN_QUERY } from "./gql";
import { MyPlanQueryData, PlanLimitKey, PlanLimitUsage } from "./interface";

/**
 * Quanto de um teto já foi ocupado — a resposta que decide se o botão de criar
 * fica ativo.
 *
 * Separado de `usePlan` porque custa: pedir `limits` faz o backend contar uma
 * vez por teto. Só as telas com botão de criar perguntam, e o cache do Apollo
 * responde às seguintes sem ir à rede.
 *
 * Enquanto carrega, `isAtLimit` é falso: bloquear por precaução deixaria o dono
 * da conta olhando para um botão desabilitado sem explicação — e quem recusa de
 * verdade é a mutation, com a frase certa.
 */
export const usePlanLimit = (
  key: PlanLimitKey
): { usage: PlanLimitUsage | null; isAtLimit: boolean; loading: boolean } => {
  const { data, loading } = useQuery<MyPlanQueryData>(MY_PLAN_QUERY, {
    fetchPolicy: "cache-first",
  });

  const usage =
    data?.myPlan?.data?.limits?.find((item) => item.key === key) ?? null;

  return { usage, isAtLimit: usage?.isAtLimit ?? false, loading };
};

/**
 * A frase que explica o botão desabilitado. Fica junto do hook para não haver
 * duas redações do mesmo limite circulando pelas telas.
 */
export const limitReachedMessage = (usage: PlanLimitUsage | null): string => {
  if (!usage || usage.limit === null) return "";
  return `Seu plano permite até ${usage.limit} ${usage.label}. Fale com o suporte para aumentar o limite.`;
};
