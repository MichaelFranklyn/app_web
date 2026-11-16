import { ListPageSkeleton } from "@/components/ListPageSkeleton";

export default function Loading() {
  return (
    <ListPageSkeleton
      page="platformActivity"
      title="Histórico de ações"
      description="O que os usuários fizeram no sistema."
      listTitle="Ações"
      columns={["Quando", "Ação", "Quem", "Resultado", "Duração"]}
    />
  );
}
