"use client";

import { ReactNode } from "react";

import { PlanFeature, useFeature } from "@/services/plan";

interface FeatureGateProps {
  /** Recurso do plano que este pedaço da tela exige. */
  feature: PlanFeature;
  /** O que aparece no lugar quando o plano não tem o recurso (raro). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Esconde o que o plano da empresa não contratou.
 *
 * Ao contrário do teto de volume (`PlanLimitGate`, que deixa o botão visível e
 * explica o limite), recurso ausente SOME da tela — é a mesma regra da sidebar:
 * quem nunca teve o motor de rotina não precisa saber que ele existe cada vez
 * que abre um cliente. Botão que fica na tela e recusa no clique é pior: parece
 * defeito, não plano.
 *
 * O gate é de tela, não de segurança: quem recusa de verdade é o backend
 * (`core/graphql/plan_gate.py`), campo raiz por campo raiz. Aqui só se evita
 * oferecer o que a API vai negar.
 */
export function FeatureGate({
  feature,
  fallback = null,
  children,
}: FeatureGateProps) {
  return useFeature(feature) ? <>{children}</> : <>{fallback}</>;
}
