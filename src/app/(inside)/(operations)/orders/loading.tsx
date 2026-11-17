import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`: cabeçalho + 4 KPIs + lista de pedidos. A 1ª página da
// lista é buscada no servidor; sem este limite de Suspense a tela fica em branco
// até a query voltar.
export default function Loading() {
  return (
    <ListPageSkeleton
      page="orders"
      title="Pedidos"
      description="Gestão de pedidos por fábrica e vendedor."
      actions={4}
      kpis={{ count: 4, cols: { base: 2, tablet: 2, desktop: 4 }, help: true }}
      tabs={["Todos os pedidos", "Esperando faturamento", "Esperando entrega"]}
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
