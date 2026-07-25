"use client";

import { Button } from "@/components/Button";
import { Pencil } from "lucide-react";

interface Props {
  title: string;
  onClick: () => void;
}

/**
 * Ação de editar no cabeçalho de um card do perfil: sólida e âmbar. Não segue o
 * neutro da taxonomia geral de "editar" porque aqui ela É a ação principal do
 * card — é o que a pessoa vem fazer nesta tela.
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
      noUppercase
      label={title}
      onClick={onClick}
    >
      <Button.Icon icon={Pencil} />
      <Button.Title>{title}</Button.Title>
    </Button.Root>
  );
}
