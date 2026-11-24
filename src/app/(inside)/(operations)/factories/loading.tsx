import { ListPageSkeleton } from "@/components/ListPageSkeleton";
import { FactoriesGridSkeleton } from "./_components/FactoriesGridSkeleton";

// A lista de fábricas é um grid de cards (não uma tabela), então o corpo reusa o
// mesmo placeholder que a `FactoriesGrid` já mostra durante o loading no cliente.
export default function Loading() {
  return (
    <ListPageSkeleton
      page="factories"
      title="Fábricas Representadas"
      // O servidor não sabe o papel aqui: vai a frase do gestor, a mais comum
      // (o header troca pela do vendedor quando hidrata).
      description="As fábricas que a sua empresa representa."
      actions={["w-[260px]", "w-[120px]", "w-[120px]"]}
    >
      <FactoriesGridSkeleton />
    </ListPageSkeleton>
  );
}
