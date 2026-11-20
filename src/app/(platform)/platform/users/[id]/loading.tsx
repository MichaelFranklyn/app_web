import { ListPageSkeleton } from "@/components/ListPageSkeleton";

export default function Loading() {
  return (
    <ListPageSkeleton
      page="platformUsers"
      title="Pessoa"
      actions={2}
      kpis={{ count: 4 }}
      listTitle="O que fez"
      cards
      columns={["Quando", "Ação", "Resultado", "Duração"]}
    />
  );
}
