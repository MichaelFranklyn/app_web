"use client";

import { Avatar } from "@/components/Avatar";
import { Table } from "@/components/Table";
import { Tooltip } from "@/components/Tooltip";
import { ClientSeller } from "../../interface";

interface SellerCellProps {
  sellers: ClientSeller[];
  /**
   * Vendedor filtrado na lista. Vai para a frente da célula: filtrando por
   * "Rafael" e lendo "Carlos +24" na linha, o gestor pensaria que o filtro falhou.
   */
  highlightSellerId: string | null;
}

/**
 * Vendedor que atende o cliente. O vínculo é por fábrica, então um cliente pode
 * ser atendido por mais de um: mostramos o primeiro e "+N" com os nomes no
 * tooltip — a linha da tabela não comporta a lista inteira.
 */
export function SellerCell({ sellers, highlightSellerId }: SellerCellProps) {
  const highlighted = highlightSellerId
    ? sellers.find((seller) => seller.id === highlightSellerId)
    : undefined;
  const rest = sellers.filter((seller) => seller.id !== highlighted?.id);
  const first = highlighted ?? rest.shift();

  if (!first) {
    return (
      <Table.Cell flex>
        <Avatar size="sm" color="neutral" initials="—" />
        <Table.CellText variant="dim">Sem vendedor</Table.CellText>
      </Table.Cell>
    );
  }

  return (
    <Table.Cell flex>
      <Avatar
        size="sm"
        color="amber"
        initials={first.name.slice(0, 2).toUpperCase()}
      />
      <Table.CellText variant="dim" className="whitespace-nowrap">
        {first.name}
      </Table.CellText>
      {rest.length > 0 && (
        <Tooltip
          className="max-w-100 whitespace-normal"
          content={`Também atendem: ${rest.map((seller) => seller.name).join(", ")}`}
        >
          <Table.CellText variant="dim">+{rest.length}</Table.CellText>
        </Tooltip>
      )}
    </Table.Cell>
  );
}
