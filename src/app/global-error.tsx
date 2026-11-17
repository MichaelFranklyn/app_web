"use client";

import { Button } from "@/components/Button";
import { RouteError } from "@/components/RouteError";
import { useReportRouteError } from "@/hooks/useReportRouteError";
import { TriangleAlert } from "lucide-react";
import "../styles/globals.css";

/**
 * Último recurso: erro no PRÓPRIO layout raiz, onde nenhum `error.tsx` de grupo
 * alcança. Este arquivo substitui o layout inteiro, então traz `<html>`,
 * `<body>` e o CSS — sem eles a tela sai sem estilo. As fontes do layout não
 * vêm junto; a do sistema basta para um recado de uma linha.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useReportRouteError(error, "global-boundary");
  return (
    <html lang="pt-BR">
      <body>
        <RouteError
          icon={<TriangleAlert size={36} />}
          title="Algo deu errado"
          description="Houve um problema inesperado ao abrir o Itinus. Tente de novo em instantes."
        >
          <Button.Root
            appearance="solid"
            color="amber"
            size="md"
            onClick={reset}
          >
            <Button.Title>Tentar novamente</Button.Title>
          </Button.Root>
        </RouteError>
      </body>
    </html>
  );
}
