"use client";

import { Button } from "@/components/Button";
import { RouteError } from "@/components/RouteError";
import { useReportRouteError } from "@/hooks/useReportRouteError";
import { TriangleAlert } from "lucide-react";

/**
 * Falha inesperada no login, cadastro ou recuperação de senha. A saída
 * alternativa é o login: é a porta de todas as telas deste grupo.
 */
export default function AuthError({
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
      description="Houve um problema inesperado. Tente de novo ou volte para a tela de entrada."
    >
      <Button.Root appearance="solid" color="amber" size="md" onClick={reset}>
        <Button.Title>Tentar novamente</Button.Title>
      </Button.Root>
      <Button.Link href="/login" appearance="outline" color="neutral" size="md">
        <Button.Title>Ir para o login</Button.Title>
      </Button.Link>
    </RouteError>
  );
}
