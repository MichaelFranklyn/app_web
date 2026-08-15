"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { Package } from "lucide-react";
import { useActionState } from "react";
import { PortalStockItem } from "../interface";
import { PortalStockRow } from "./_components/PortalStockRow";
import { StockFormState, submitPortalStockAction } from "./actions";

interface PortalStockContentProps {
  items: PortalStockItem[];
  token: string;
}

const INITIAL_STATE: StockFormState = { status: "idle", message: "" };

/**
 * O cliente conta a própria prateleira.
 *
 * É a tela que mais muda o sistema do outro lado: hoje esse número só existe
 * quando o vendedor vai até a loja ou liga, e é ele que responde por mais da
 * metade do score que decide a rotina. Por isso o formulário pede pouco — um
 * campo por produto, já preenchido com a estimativa atual — e nada é
 * obrigatório: quem souber de três produtos manda três.
 */
export function PortalStockContent({ items, token }: PortalStockContentProps) {
  const [state, formAction, isPending] = useActionState(
    submitPortalStockAction,
    INITIAL_STATE
  );

  if (items.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Package size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>Nada para acompanhar ainda</EmptyState.Title>
        <EmptyState.Description>
          Assim que você fizer o primeiro pedido, os produtos aparecem aqui para
          você avisar quando estiverem acabando.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[16px]">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-[4px]">
        <Title variant="eyebrow" color="muted">
          Meu estoque
        </Title>
        <Title variant="body-sm" color="muted">
          Quantos dias cada produto ainda dura na sua loja? Preencha só o que
          você souber — isso ajuda seu representante a chegar na hora certa.
        </Title>
      </div>

      {state.status !== "idle" ? (
        <Alert.Root variant={state.status === "success" ? "success" : "error"}>
          <Alert.Description>{state.message}</Alert.Description>
        </Alert.Root>
      ) : null}

      {/* Grade, e não pilha: a lista passa de 40 produtos, e em coluna única o
          cliente rola quatro telas para chegar ao fim. Uma coluna no celular
          (onde o card já ocupa a largura toda), duas no tablet e quatro no
          desktop. */}
      <div className="tablet:grid-cols-2 desktop:grid-cols-4 grid grid-cols-1 gap-[12px]">
        {items.map((item) => (
          <PortalStockRow key={item.productId} item={item} />
        ))}
      </div>

      {/* Fixo no rodapé: a lista costuma passar de 40 produtos, e um botão só
          no fim obrigaria a rolar tudo de volta depois de preencher dois. */}
      <div className="sticky bottom-0 -mx-[16px] border-t border-(--border) bg-(--bg) px-[16px] py-[12px]">
        <Button.Root
          type="submit"
          appearance="solid"
          color="amber"
          size="md"
          fullWidth
          noUppercase
          loading={isPending}
        >
          <Button.Title>Enviar para o meu representante</Button.Title>
        </Button.Root>
      </div>
    </form>
  );
}
