"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { useFeature } from "@/services/plan";
import { Upload } from "lucide-react";
import { useState } from "react";

import { ImportOrderModal } from "./ImportOrderModal";
import { FactoryOrder } from "./gql";

interface OrdersMoreMenuProps {
  factoryId: string;
  onChanged: () => void;
  onAddOptimistic: (order: FactoryOrder) => void;
}

/**
 * "Mais ações" da aba de pedidos da fábrica.
 *
 * "Importar pedido" era um terceiro botão ao lado de Filtros e Novo pedido: no
 * celular os três disputavam a linha e o uso de todo dia (filtrar, criar)
 * perdia o nome (crítica de 23/11/2026). Importar é ida ocasional; fica aqui.
 * Sem o recurso no plano, o menu inteiro some.
 */
export function OrdersMoreMenu({
  factoryId,
  onChanged,
  onAddOptimistic,
}: OrdersMoreMenuProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const canImport = useFeature("BULK_IMPORT");

  if (!canImport) return null;

  const options: MoreOption[] = [
    {
      label: "Importar pedido",
      icon: Upload,
      onClick: () => setIsImportOpen(true),
    },
  ];

  return (
    <>
      <MoreOptions options={options} label="Mais ações dos pedidos" showLabel />
      <ImportOrderModal
        factoryId={factoryId}
        onChanged={onChanged}
        onAddOptimistic={onAddOptimistic}
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />
    </>
  );
}
