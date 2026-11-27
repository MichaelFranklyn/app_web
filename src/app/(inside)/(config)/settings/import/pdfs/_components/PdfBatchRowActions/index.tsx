"use client";

import { RowActions } from "@/components/RowActions";
import { Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";

import { DeletePdfBatchModal } from "../DeletePdfBatchModal";

type Controlled<T> = Omit<T, "open" | "onOpenChange">;

interface Props {
  remove: Controlled<ComponentProps<typeof DeletePdfBatchModal>>;
}

/** Ações da linha do lote (hoje só excluir, que vira botão); abrir é clicar na linha. */
export function PdfBatchRowActions({ remove }: Props) {
  const [removing, setRemoving] = useState(false);

  return (
    <RowActions
      label={`Ações do lote de ${remove.batch.factoryName}`}
      actions={[
        {
          label: "Excluir lote",
          icon: Trash2,
          danger: true,
          hint: "Tira o lote e os PDFs desta lista. Os pedidos já importados continuam; para removê-los, use Desfazer em Importações feitas.",
          onClick: () => setRemoving(true),
        },
      ]}
    >
      <DeletePdfBatchModal
        {...remove}
        open={removing}
        onOpenChange={setRemoving}
      />
    </RowActions>
  );
}
