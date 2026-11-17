"use client";

import { Button } from "@/components/Button";
import { Pencil } from "lucide-react";

interface Props {
  title: string;
  onClick: () => void;
}

/**
 * Ação no cabeçalho de um card (perfil, empresa): botão primário, igual aos de
 * adicionar das outras caixas — decisão do produto em 17/11/2026, para toda
 * caixa ter a sua ação com o mesmo peso.
 *
 * O header colapsa o texto por medição, então o `label` mantém o nome acessível
 * quando só o ícone aparece.
 */
export function EditCardAction({ title, onClick }: Props) {
  return (
    <Button.Root
      appearance="solid"
      color="amber"
      size="sm"
      label={title}
      onClick={onClick}
    >
      <Button.Icon icon={Pencil} />
      <Button.Title>{title}</Button.Title>
    </Button.Root>
  );
}
