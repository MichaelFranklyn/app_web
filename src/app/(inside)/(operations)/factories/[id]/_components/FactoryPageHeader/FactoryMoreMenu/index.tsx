"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteCompanyFactoryModal } from "../DeleteCompanyFactoryModal";

interface Props {
  companyFactoryId: string;
  factoryName: string;
}

/**
 * Excluir o vínculo num menu, e não como botão vermelho ao lado de Editar.
 *
 * A exclusão cascateia acessos, carteira e catálogo: é ida rara e grave, e o
 * botão solto ficava a um toque de distância do Editar, que é o uso comum
 * (crítica de 23/11/2026). Mesmo padrão da ficha do cliente.
 */
export function FactoryMoreMenu({ companyFactoryId, factoryName }: Props) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const options: MoreOption[] = [
    {
      label: "Excluir vínculo",
      icon: Trash2,
      danger: true,
      onClick: () => setIsDeleteOpen(true),
    },
  ];

  return (
    <>
      <MoreOptions options={options} label="Mais ações da fábrica" showLabel />
      <DeleteCompanyFactoryModal
        companyFactoryId={companyFactoryId}
        factoryName={factoryName}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
