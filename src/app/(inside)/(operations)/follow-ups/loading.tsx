import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`. A 1ª página vem do SERVIDOR: sem este limite de
// Suspense a tela fica em branco enquanto a consulta não responde.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Contatos agendados"
      description="Com quem você combinou de falar, quando e por quê."
      actions={1}
      listTitle="Contatos"
      columns={["Dia", "Cliente", "Motivo", "Situação"]}
    />
  );
}
