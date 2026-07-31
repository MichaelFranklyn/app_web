import { ListPageSkeleton } from "@/components/ListPageSkeleton";
import { FactoriesGridSkeleton } from "./_components/FactoriesGridSkeleton";

// A lista de fábricas é um grid de cards (não uma tabela), então o corpo reusa o
// mesmo placeholder que a `FactoriesGrid` já mostra durante o loading no cliente.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Fábricas Representadas"
      description="Fábricas cujos produtos são vendidos pela empresa. Entidade global da plataforma."
      actions={["w-[260px]", "w-[120px]", "w-[120px]"]}
    >
      <FactoriesGridSkeleton />
    </ListPageSkeleton>
  );
}
