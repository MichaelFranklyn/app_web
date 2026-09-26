import { ListPageSkeleton } from "@/components/ListPageSkeleton";

/** Esqueleto da tela: o mesmo do `loading.tsx` e do primeiro carregamento. */
export function StalledOrdersSkeleton() {
  return (
    <ListPageSkeleton
      title="Pedidos parados"
      listTitle="Faturados sem entrega confirmada"
      columns={[
        "",
        "Cliente",
        "Fábrica",
        "Vendedor",
        "Faturado em",
        "Entregue em",
        "Valor",
      ]}
    />
  );
}
