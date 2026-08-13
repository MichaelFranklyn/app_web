import { ListPageSkeleton } from "@/components/ListPageSkeleton";

export default function Loading() {
  return (
    <ListPageSkeleton
      title="Auditoria"
      description="Tudo que a plataforma fez sobre as empresas."
      listTitle="Ações registradas"
      columns={["Quando", "Ação", "Alvo", "Quem"]}
    />
  );
}
