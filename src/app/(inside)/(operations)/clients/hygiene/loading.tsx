import { ListPageSkeleton } from "@/components/ListPageSkeleton";
import { HYGIENE_COLUMNS, HYGIENE_DESCRIPTION, HYGIENE_TITLE } from "./utils";

// Espelha `content.tsx`. A página resolve o papel no servidor antes de
// renderizar — sem este limite de Suspense a tela fica em branco enquanto isso.
export default function Loading() {
  return (
    <ListPageSkeleton
      title={HYGIENE_TITLE}
      description={HYGIENE_DESCRIPTION}
      listTitle="Para revisar"
      columns={HYGIENE_COLUMNS}
    />
  );
}
