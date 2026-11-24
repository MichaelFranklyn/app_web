"use client";

import { Alert } from "@/components/Alert";
import { Sparkles } from "lucide-react";

import { OPPORTUNITIES_TAGLINE } from "../../utils";

/**
 * A frase da aba Oportunidades. O título, as abas e o vendedor escolhido pelo
 * gestor são da central (`priorities/layout.tsx`).
 */
export function OpportunitiesHeader() {
  return (
    // Mesmo tratamento da aba Pendências: aviso informativo, não texto corrido
    // em cinza (14/11/2026). Texto fixo → role="note".
    <Alert.Root variant="info" role="note">
      <Alert.Icon icon={Sparkles} />
      <Alert.Content>
        {/* Uma linha só (crítica de 23/11/2026): a diferença para Pendências
            já está no tour e no estado vazio; aqui era a segunda frase que
            empurrava os cartões para baixo da dobra no celular. */}
        <Alert.Title>{OPPORTUNITIES_TAGLINE}</Alert.Title>
      </Alert.Content>
    </Alert.Root>
  );
}
