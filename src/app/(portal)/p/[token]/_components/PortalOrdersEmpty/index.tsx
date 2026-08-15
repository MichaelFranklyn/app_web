import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";
import Link from "next/link";

interface PortalOrdersEmptyProps {
  token: string;
  page: number;
}

/**
 * Lista vazia — por dois motivos que não podem dividir a mesma mensagem.
 *
 * Na primeira página, vazio quer dizer que o cliente ainda não comprou. Numa
 * página adiante, quer dizer que a lista acabou (endereço com `?p=` guardado no
 * histórico, ou digitado). Dizer "nenhum pedido por aqui" a um cliente que tem
 * oito é o tipo de erro que faz ele ligar para o vendedor achando que sumiu
 * tudo.
 */
export function PortalOrdersEmpty({ token, page }: PortalOrdersEmptyProps) {
  if (page > 1) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Package size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>Você chegou ao fim da lista</EmptyState.Title>
        <EmptyState.Description>
          Não há pedidos mais antigos para mostrar.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Link
            href={`/p/${token}`}
            className="rounded-[8px] border border-(--border) px-[16px] py-[10px] text-[14px] text-(--text2) hover:bg-(--bg3)"
          >
            Voltar para os pedidos recentes
          </Link>
        </EmptyState.Actions>
      </EmptyState.Root>
    );
  }

  return (
    <EmptyState.Root>
      <EmptyState.Icon>
        <Package size={36} />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum pedido por aqui ainda</EmptyState.Title>
      <EmptyState.Description>
        Assim que o seu primeiro pedido for fechado, ele aparece nesta página.
      </EmptyState.Description>
    </EmptyState.Root>
  );
}
