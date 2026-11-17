"use client";

import { Button } from "@/components/Button";
import { RouteError } from "@/components/RouteError";
import { useReportRouteError } from "@/hooks/useReportRouteError";
import { TriangleAlert } from "lucide-react";

/**
 * Falha inesperada no portal do cliente (backend fora do ar, resposta
 * quebrada). Link vencido NÃO cai aqui: o layout de `/p/[token]` já mostra o
 * `LinkExpired`.
 *
 * Só "tentar de novo": quem abre o portal não tem um "início" fora do próprio
 * link, e a outra saída real é falar com o representante.
 */
export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useReportRouteError(error);
  return (
    <RouteError
      icon={<TriangleAlert size={36} />}
      title="Não foi possível abrir esta página"
      description="Houve um problema do nosso lado. Tente de novo em instantes; se continuar, fale com o seu representante."
    >
      <Button.Root appearance="solid" color="amber" size="md" onClick={reset}>
        <Button.Title>Tentar novamente</Button.Title>
      </Button.Root>
    </RouteError>
  );
}
