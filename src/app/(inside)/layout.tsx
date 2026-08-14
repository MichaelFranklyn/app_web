import { AppProviders } from "@/components/AppProviders";
import { PlanProvider } from "@/services/plan";
import type { Metadata } from "next";
import { getPlanContract } from "@/services/plan/server";
import InsideShell from "./content";

/**
 * Carrega o que a empresa contratou ANTES de a casca renderizar.
 *
 * Aqui e não num fetch do cliente: a sidebar depende do plano para saber quais
 * destinos existem, e buscar depois faria os itens aparecerem (ou sumirem) meio
 * segundo após a tela abrir — na cara de quem já estava lendo o menu.
 *
 * O custo é uma consulta leve: `getPlanContract` não pede os tetos de uso, que
 * são o que faria o backend contar tabela por tabela.
 */
/**
 * Nada do sistema vai para a busca. O `robots.txt` já desencoraja o rastreio e
 * o `proxy.ts` devolve 307 para quem não tem sessão; este `noindex` é a rede
 * para o caso de uma URL interna vazar em um link e o buscador tentar mesmo
 * assim.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InsideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plan = await getPlanContract();

  return (
    <AppProviders>
      <PlanProvider plan={plan}>
        <InsideShell>{children}</InsideShell>
      </PlanProvider>
    </AppProviders>
  );
}
