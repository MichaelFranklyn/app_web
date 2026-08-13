import { ListPageSkeleton } from "@/components/ListPageSkeleton";

export default function Loading() {
  return (
    <ListPageSkeleton
      title="Pessoa"
      actions={2}
      kpis={{ count: 4 }}
      listTitle="O que fez"
      columns={["Quando", "Ação", "Resultado", "Duração"]}
    />
  );
}
