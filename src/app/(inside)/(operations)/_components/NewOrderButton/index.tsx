"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { NewOrderFrom, newOrderUrl } from "@/utils/newOrderUrl";

interface Props {
  from?: Exclude<NewOrderFrom, { visitItemId: string }>;
  label?: string;
}

/**
 * Leva para a página de novo pedido (`/orders/new`). Da tela do cliente ou da
 * fábrica, ela abre com o cliente/fábrica já decididos e volta para cá ao
 * cancelar.
 *
 * Pedido digitado item a item tem página própria: os dados e a lista de itens
 * precisam de espaço, e um modal apertava os dois.
 */
export function NewOrderButton({ from, label = "Novo Pedido" }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Button.Root
      appearance="solid"
      color="amber"
      size="sm"
      onClick={() => router.push(newOrderUrl(from, pathname))}
    >
      <Button.Icon icon={Plus} />
      <Button.Title>{label}</Button.Title>
    </Button.Root>
  );
}
