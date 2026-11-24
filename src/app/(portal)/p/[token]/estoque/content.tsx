"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { PortalPageHeader } from "../_components/PortalPageHeader";
import { PortalStockItem } from "../interface";
import { PortalStockTable } from "./_components/PortalStockTable";
import { StockFormState, submitPortalStockAction } from "./actions";
import { STOCK_PAGE_DESCRIPTION, stockSubmitLabel } from "./utils";

interface PortalStockContentProps {
  items: PortalStockItem[];
  token: string;
}

const INITIAL_STATE: StockFormState = { status: "idle", message: "" };

/** Quantos campos de dias o cliente já preencheu (em qualquer página). */
const countFilled = (form: HTMLFormElement | null): number =>
  form
    ? Array.from(
        form.querySelectorAll<HTMLInputElement>('input[name^="days__"]')
      ).filter((input) => input.value.trim() !== "").length
    : 0;

/**
 * O cliente conta a própria prateleira.
 *
 * É a tela que mais muda o sistema do outro lado: hoje esse número só existe
 * quando o vendedor vai até a loja ou liga, e é ele que responde por mais da
 * metade do score que decide a rotina. Por isso o formulário pede pouco — um
 * campo por produto, em branco, com a estimativa atual no badge — e nada é
 * obrigatório: quem souber de três produtos manda três. O botão conta quantos
 * vão, para o cliente ver que o que ele digitou em outra página também segue.
 */
export function PortalStockContent({ items, token }: PortalStockContentProps) {
  const [state, formAction, isPending] = useActionState(
    submitPortalStockAction,
    INITIAL_STATE
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [filled, setFilled] = useState(0);

  // Depois do envio o React limpa os campos do form: o contador relê o que
  // sobrou, para o botão não prometer "Enviar 3 produtos" com tudo em branco.
  useEffect(() => {
    setFilled(countFilled(formRef.current));
  }, [state]);

  // Depois de um envio, a lista boa é a que a action releu: é ela que traz a
  // estimativa nova ao lado da confirmação. Antes disso, a que veio do servidor.
  const rows = state.items ?? items;

  // O botão mora no header, que fica DENTRO do <form>: o submit continua
  // nativo (funciona antes do JS) e o cliente o vê sem rolar a lista toda.
  const submit = (
    <Button.Root
      type="submit"
      appearance="solid"
      color="amber"
      size="md"
      loading={isPending}
    >
      <Button.Title>{stockSubmitLabel(filled)}</Button.Title>
    </Button.Root>
  );

  const header = (
    <PortalPageHeader
      heading="product"
      title="Meu estoque"
      description={STOCK_PAGE_DESCRIPTION}
      actions={rows.length > 0 ? submit : undefined}
    />
  );

  if (rows.length === 0) {
    return (
      <>
        {header}
        <EmptyState.Root>
          <EmptyState.Icon>
            <Package />
          </EmptyState.Icon>
          <EmptyState.Title>Nada para acompanhar ainda</EmptyState.Title>
          <EmptyState.Description>
            Assim que você fizer o primeiro pedido, os produtos aparecem aqui
            para você avisar quando estiverem acabando.
          </EmptyState.Description>
        </EmptyState.Root>
      </>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={() => setFilled(countFilled(formRef.current))}
      className="flex flex-col gap-20"
    >
      <input type="hidden" name="token" value={token} />
      {header}

      {state.status !== "idle" ? (
        <Alert.Root variant={state.status === "success" ? "success" : "error"}>
          <Alert.Description>{state.message}</Alert.Description>
        </Alert.Root>
      ) : null}

      <PortalStockTable items={rows} />
    </form>
  );
}
