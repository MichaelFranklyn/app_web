import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// A rota resolve o papel no servidor antes de renderizar; sem este limite de
// Suspense o navegador não recebe nada enquanto o guard não responde.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Rede"
      description="Lojas do grupo e o consolidado da rede."
      kpis={{ count: 3 }}
      listTitle="Lojas da rede"
      columns={["Loja", "Cidade", "Segmento", "Vendedor", "Última compra"]}
    />
  );
}
