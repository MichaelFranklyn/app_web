import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`: cabeçalho + 4 KPIs + lista de pedidos. A 1ª página da
// lista é buscada no servidor; sem este limite de Suspense a tela fica em branco
// até a query voltar.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Pedidos"
      description="Gestão de pedidos por fábrica e vendedor."
      actions={2}
      kpis={{ count: 4, cols: { base: 1, tablet: 2, desktop: 4 } }}
      tabs={["Todos os pedidos", "Ainda não faturados"]}
      listTitle="Lista de pedidos"
      columns={[
        "Pedido",
        "Cliente",
        "Fábrica",
        "Vendedor",
        "Data do pedido",
        "Faturamento",
        "Situação",
        "Valor",
        "Comissão",
      ]}
    />
  );
}
