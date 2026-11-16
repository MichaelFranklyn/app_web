import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Send } from "lucide-react";
import { SentOrdersTab, sentOrdersHref } from "../../utils";

interface SentOrdersEmptyProps {
  token: string;
  /** Página além da última: o vazio é do endereço, não da conta. */
  page: number;
  /** Aba vazia não é conta vazia: o texto diz o que falta NESTE recorte. */
  tab: SentOrdersTab;
  canOrder: boolean;
}

const TAB_EMPTY: Record<
  Exclude<SentOrdersTab, "todos">,
  { title: string; description: string }
> = {
  pedidos: {
    title: "Nenhum pedido feito ainda",
    description:
      "Quando o representante confirmar um pedido seu, ele aparece aqui.",
  },
  orcamentos: {
    title: "Nenhum orçamento pedido",
    description:
      "Os orçamentos que você pedir ao representante por aqui aparecem nesta aba, com a resposta dele.",
  },
};

export function SentOrdersEmpty({
  token,
  page,
  tab,
  canOrder,
}: SentOrdersEmptyProps) {
  const copy = tab === "todos" ? null : TAB_EMPTY[tab];
  if (page > 1) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Send size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>Nada nesta página</EmptyState.Title>
        <EmptyState.Actions>
          <Button.Link
            href={sentOrdersHref(token, 1, tab)}
            appearance="outline"
            color="neutral"
          >
            <Button.Title>Ver os mais recentes</Button.Title>
          </Button.Link>
        </EmptyState.Actions>
      </EmptyState.Root>
    );
  }

  return (
    <EmptyState.Root>
      <EmptyState.Icon>
        <Send size={36} />
      </EmptyState.Icon>
      <EmptyState.Title>
        {copy?.title ?? "Você ainda não tem pedidos"}
      </EmptyState.Title>
      <EmptyState.Description>
        {copy?.description ??
          "Seus pedidos feitos e os orçamentos que você pedir ao representante aparecem nesta tela."}
      </EmptyState.Description>
      {canOrder ? (
        <EmptyState.Actions>
          <Button.Link
            href={`/p/${token}/pedido`}
            appearance="solid"
            color="amber"
          >
            <Button.Title>Fazer pedido</Button.Title>
          </Button.Link>
        </EmptyState.Actions>
      ) : null}
    </EmptyState.Root>
  );
}
