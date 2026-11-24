import { Button } from "@/components/Button";
import { RouteError } from "@/components/RouteError";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

/**
 * Endereço que não existe, em qualquer grupo de rotas. Sem este arquivo o Next
 * mostra o "404 | This page could not be found." em inglês, sem saída.
 *
 * O botão vai para `/`: quem tem sessão é levado dali ao painel, quem não tem
 * cai na página inicial — um destino só serve aos dois.
 */
export default function NotFound() {
  return (
    <RouteError
      icon={<SearchX />}
      title="Página não encontrada"
      description="O endereço que você abriu não existe ou mudou de lugar. Confira o link ou volte para o início."
    >
      <Button.Link href="/" appearance="solid" color="amber" size="md">
        <Button.Title>Ir para o início</Button.Title>
      </Button.Link>
    </RouteError>
  );
}
