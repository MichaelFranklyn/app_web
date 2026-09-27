"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { PublicPage } from "@/components/PublicPage";
import { Title } from "@/components/Title";
import { PackageCheck } from "lucide-react";
import { useActionState } from "react";
import { PortalReplenishmentItem } from "../interface";
import { PortalReplenishRow } from "./_components/PortalReplenishRow";
import { ReplenishFormState, requestReplenishmentAction } from "./actions";

interface PortalReplenishContentProps {
  token: string;
  /** O plano do escritório inclui o pedido pelo portal. */
  available: boolean;
  horizonDays: number;
  items: PortalReplenishmentItem[];
}

const INITIAL_STATE: ReplenishFormState = { status: "idle", message: "" };

/**
 * "Seu estoque de X está acabando" — e o pedido com um toque.
 *
 * A lista sai da estimativa de estoque (a mesma que move a rotina do
 * representante). O que o cliente envia vira um ORÇAMENTO para o representante:
 * preço, condição e frete são conversa dele, por isso não há preço aqui e o
 * texto diz, antes do botão, que ele confirma.
 */
export function PortalReplenishContent({
  token,
  available,
  horizonDays,
  items,
}: PortalReplenishContentProps) {
  const [state, formAction, isPending] = useActionState(
    requestReplenishmentAction,
    INITIAL_STATE
  );
  const rows = state.items ?? items;

  if (!available) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <PackageCheck size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>Pedidos pelo portal indisponíveis</EmptyState.Title>
        <EmptyState.Description>
          Para pedir reposição, fale com o seu representante.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  const feedback =
    state.status !== "idle" ? (
      <Alert.Root variant={state.status === "success" ? "success" : "error"}>
        <Alert.Description>{state.message}</Alert.Description>
      </Alert.Root>
    ) : null;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-[16px]">
        {feedback}
        <EmptyState.Root>
          <EmptyState.Icon>
            <PackageCheck size={36} />
          </EmptyState.Icon>
          <EmptyState.Title>Nada acabando por enquanto</EmptyState.Title>
          <EmptyState.Description>
            Quando algum produto estiver a {horizonDays} dias de acabar, ele
            aparece aqui para você pedir.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[16px]">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-[4px]">
        <Title variant="eyebrow" color="muted">
          Repor
        </Title>
        <Title variant="body-sm" color="muted">
          Estes produtos devem acabar nos próximos {horizonDays} dias. Marque o
          que quer pedir — a quantidade já vem com a da sua última compra.
        </Title>
      </div>

      {feedback}

      {/* `key` muda a cada envio que deu certo: a grade remonta e as marcas
          somem — o que foi pedido passa a aparecer como "já pedido". */}
      <Grid.Root
        key={state.submission ?? 0}
        cols={{ base: 1, tablet: 2, desktop: 4 }}
        gap={12}
      >
        {rows.map((item) => (
          <PortalReplenishRow key={item.productId} item={item} />
        ))}
      </Grid.Root>

      <PublicPage.ActionBar>
        <div className="flex w-full flex-col gap-[8px]">
          <Title variant="body-xs" color="muted">
            Seu representante confere preço, condição e frete e confirma o
            pedido com você antes de mandar para a fábrica.
          </Title>
          <Button.Root
            type="submit"
            appearance="solid"
            color="amber"
            size="md"
            fullWidth
            noUppercase
            loading={isPending}
          >
            <Button.Title>Pedir ao meu representante</Button.Title>
          </Button.Root>
        </div>
      </PublicPage.ActionBar>
    </form>
  );
}
