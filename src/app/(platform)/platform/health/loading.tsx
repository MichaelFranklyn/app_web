import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// A página busca o estado técnico no servidor antes de renderizar; sem este
// limite de Suspense a rota entra em branco até a query voltar.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Saúde"
      description="Estado técnico da plataforma: banco, jobs agendados e pendências."
      kpis={{ count: 3, cols: { base: 1, tablet: 3 } }}
      listTitle="Jobs agendados"
      columns={["Job", "Quando roda", "Última execução", "Resultado"]}
    />
  );
}
