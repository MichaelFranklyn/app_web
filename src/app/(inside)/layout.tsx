import { PlanProvider } from "@/services/plan";
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
export default async function InsideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plan = await getPlanContract();

  return (
    <PlanProvider plan={plan}>
      <InsideShell>{children}</InsideShell>
    </PlanProvider>
  );
}
