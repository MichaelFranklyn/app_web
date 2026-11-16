"use client";

import { Button } from "@/components/Button";
import { Pencil } from "lucide-react";

interface Props {
  title: string;
  onClick: () => void;
}

/**
 * Ação de editar no cabeçalho de um card do perfil: neutra, como todo "editar"
 * da taxonomia de botões. Âmbar fica só para criar/salvar — com quatro cards
 * âmbar na mesma tela, nenhum se destacava (auditoria UX, item 8).
 *
 * O header colapsa o texto por medição, então o `label` mantém o nome acessível
 * quando só o ícone aparece.
 */
export function EditCardAction({ title, onClick }: Props) {
  return (
    <Button.Root
      appearance="outline"
      color="neutral"
      size="sm"
      label={title}
      onClick={onClick}
    >
      <Button.Icon icon={Pencil} />
      <Button.Title>{title}</Button.Title>
    </Button.Root>
  );
}
