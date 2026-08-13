import { ListPageSkeleton } from "@/components/ListPageSkeleton";

export default function Loading() {
  return (
    <ListPageSkeleton
      title="Pessoas"
      description="Todas as contas da plataforma. Abra uma para liberar acesso, entrar como ela e ver o que fez."
      listTitle="Contas"
      columns={["Pessoa", "Empresa", "Papel", "Último acesso"]}
    />
  );
}
