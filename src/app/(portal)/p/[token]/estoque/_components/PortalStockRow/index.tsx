"use client";

import { Badge } from "@/components/Badges";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { PortalStockItem } from "../../../interface";
import { stockUrgency } from "../../../utils";

interface PortalStockRowProps {
  item: PortalStockItem;
  /** Fora da página ou do filtro: a linha some, mas o campo continua no form. */
  hidden: boolean;
  /** Com o seletor de fábrica à vista, repetir o nome em cada linha é ruído. */
  showFactory: boolean;
}

/**
 * Um produto e o campo de dias, numa linha da tabela (cartão no celular).
 *
 * O campo vem VAZIO, com a estimativa atual no badge ao lado. Preenchê-lo com
 * o número estimado economizaria digitação, mas o formulário manda tudo que
 * está preenchido — e o cliente acabaria confirmando, sem querer, quarenta
 * estimativas que ele nunca conferiu. Em branco, só sai daqui o que ele
 * realmente olhou.
 *
 * A linha escondida (`hidden`) não sai do DOM: o que o cliente digitou na
 * página 1 continua valendo quando ele vai para a 2, e o form nativo manda
 * tudo de uma vez — inclusive antes de o JavaScript carregar.
 */
export function PortalStockRow({
  item,
  hidden,
  showFactory,
}: PortalStockRowProps) {
  const urgency = stockUrgency(item.daysRemaining);
  const fieldId = `days__${item.productId}`;
  const subtitle = [
    item.sku ? `Código ${item.sku}` : null,
    showFactory ? item.factoryName : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Table.Row hidden={hidden}>
      <Table.Cell card="title" wrap>
        <div className="flex min-w-0 flex-col gap-2">
          <Title variant="body-md" weight="semibold" className="break-words">
            {item.productName}
          </Title>
          {subtitle ? (
            <Title variant="body-xs" color="muted" className="break-words">
              {subtitle}
            </Title>
          ) : null}
        </div>
      </Table.Cell>
      <Table.Cell label="Última compra" variant="dim">
        {item.lastPurchaseDate ? formatDate(item.lastPurchaseDate) : "—"}
      </Table.Cell>
      <Table.Cell card="status">
        <Badge.Root color={urgency.tone} size="sm">
          <Badge.Text>{urgency.label}</Badge.Text>
        </Badge.Root>
      </Table.Cell>
      {/* Detalhe, não `actions`: no cartão a célula de ações divide a linha com
          o badge, e a pergunta quebrava em quatro linhas com o campo vazando.
          Como detalhe ela ocupa a largura toda. O cabeçalho da coluna some no
          cartão, então a pergunta vem junto do campo. Tamanho `sm`, o mesmo
          dos campos numéricos em tabela do sistema. */}
      <Table.Cell align="right">
        <div className="desktop:justify-end flex items-center justify-between gap-12">
          <Input.Label htmlFor={fieldId} className="desktop:hidden">
            Ainda dura quantos dias?
          </Input.Label>
          <div className="w-[96px] shrink-0">
            <Input.Number
              id={fieldId}
              name={fieldId}
              aria-label={`Quantos dias ${item.productName} ainda dura`}
              placeholder="Dias"
              size="sm"
              inputMode="numeric"
              min={0}
              max={365}
            />
          </div>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
