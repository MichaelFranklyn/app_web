import { Table } from "@/components/Table";
import { ReactNode } from "react";
import { OrderableProduct } from "../../interface";
import { OrderProductRow } from "../OrderProductRow";

export type ProductTableItem = OrderableProduct & {
  pendingQuantity: string | null;
};

interface ProductTableProps<T extends ProductTableItem> {
  id?: string;
  title: string;
  description?: ReactNode;
  items: T[];
  isInCart: (productId: string) => boolean;
  onAdd: (item: OrderableProduct) => void;
  onRemove: (productId: string) => void;
  /** Coluna extra de situação — o "Está acabando" mostra a urgência. */
  status?: { label: string; render: (item: T) => ReactNode };
  /** O que mostrar sem produtos (a busca que não achou nada). */
  empty?: ReactNode;
  /** Rodapé: paginação ou "Ver todos". */
  footer?: ReactNode;
  /** À direita do título — a busca do catálogo. */
  actions?: ReactNode;
}

/**
 * A tabela de produtos do pedido — a mesma das listas da plataforma. Cada
 * linha diz, antes de o cliente escolher, a EMBALAGEM MÍNIMA (a fábrica não
 * manda de 1 em 1) e o preço da unidade; no celular cada linha vira cartão.
 */
export function ProductTable<T extends ProductTableItem>({
  id,
  title,
  description,
  items,
  isInCart,
  onAdd,
  onRemove,
  status,
  empty,
  footer,
  actions,
}: ProductTableProps<T>) {
  const columns = status ? 5 : 4;

  return (
    <Table.Root id={id} className="scroll-mt-[16px]">
      <Table.CardHead>
        <Table.CardHead.Title>{title}</Table.CardHead.Title>
        {description ? (
          <Table.CardHead.Description>{description}</Table.CardHead.Description>
        ) : null}
        {actions ? (
          <Table.CardHead.Actions>{actions}</Table.CardHead.Actions>
        ) : null}
      </Table.CardHead>
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Produto</Table.Head>
            {status ? <Table.Head>{status.label}</Table.Head> : null}
            <Table.Head>Embalagem mínima</Table.Head>
            <Table.Head align="right">Preço por unidade</Table.Head>
            <Table.Head align="right">
              <span className="sr-only">Lista</span>
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.length === 0 && empty ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>{empty}</Table.Cell>
            </Table.Row>
          ) : (
            items.map((item) => (
              <OrderProductRow
                key={item.productId}
                item={item}
                inCart={isInCart(item.productId)}
                onAdd={onAdd}
                onRemove={onRemove}
                status={
                  status
                    ? { label: status.label, content: status.render(item) }
                    : undefined
                }
              />
            ))
          )}
        </Table.Body>
      </Table.Table>
      {footer ? <Table.Footer>{footer}</Table.Footer> : null}
    </Table.Root>
  );
}
