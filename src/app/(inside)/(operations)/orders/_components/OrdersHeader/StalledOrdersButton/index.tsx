"use client";

import { Button } from "@/components/Button";
import { Hourglass } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Leva à conferência dos pedidos parados (faturados sem entrega e confirmados
 * sem faturar). Navegação, não ação — por isso neutro.
 */
export function StalledOrdersButton() {
  const router = useRouter();

  return (
    <Button.Root
      appearance="outline"
      color="neutral"
      size="sm"
      onClick={() => router.push("/orders/stalled")}
    >
      <Button.Icon icon={Hourglass} />
      <Button.Title>Pedidos parados</Button.Title>
    </Button.Root>
  );
}
