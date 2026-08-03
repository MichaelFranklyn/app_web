import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`. A rota é filha de /clients e resolve o papel no
// servidor antes de renderizar — sem este limite de Suspense o navegador não
// recebe nada enquanto o guard não responde, e a tela fica em branco.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Redes de clientes"
      description="Lojas do mesmo grupo reunidas para você ver a rede inteira de uma vez."
      actions={1}
      listTitle="Redes"
      columns={["Rede", "Lojas", "Faturamento", "Último pedido", "Ações"]}
    />
  );
}
