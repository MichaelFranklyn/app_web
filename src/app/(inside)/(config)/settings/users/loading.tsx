import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// A página resolve o papel e faz duas queries no servidor (lista + stats de
// campo) antes de renderizar; o skeleton cobre essa espera.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Pessoas"
      description="Quem entra no sistema e quem vende em campo — uma lista só. Clique em alguém para abrir o perfil completo."
      actions={2}
      kpis={{ count: 3, cols: { base: 1, tablet: 3 } }}
      tabs={["Pessoas", "Acessos por Fábrica"]}
      listTitle="Pessoas da empresa"
      // As MESMAS três colunas da tabela, na mesma ordem: o esqueleto que
      // não bate faz a linha se reorganizar quando os dados chegam.
      columns={["Pessoa", "Desde", "Situação"]}
    />
  );
}
