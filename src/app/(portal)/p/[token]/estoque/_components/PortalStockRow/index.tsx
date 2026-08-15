import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { PortalStockItem } from "../../../interface";
import { stockUrgency } from "../../../utils";

interface PortalStockRowProps {
  item: PortalStockItem;
}

/**
 * Um produto e o campo de dias.
 *
 * O campo vem VAZIO, com a estimativa atual no rótulo ao lado. Preenchê-lo com
 * o número estimado economizaria digitação, mas o formulário manda tudo que
 * está preenchido — e o cliente acabaria confirmando, sem querer, quarenta
 * estimativas que ele nunca conferiu. Em branco, só sai daqui o que ele
 * realmente olhou.
 *
 * O card vive numa grade de até quatro colunas, então tudo empilha: numa
 * coluna de ~250px, badge e campo na mesma linha quebrariam em qualquer nome
 * de produto um pouco mais longo. `h-full` + `mt-auto` alinham os campos de
 * uma mesma linha da grade, mesmo com nomes de uma ou três linhas.
 */
export function PortalStockRow({ item }: PortalStockRowProps) {
  const urgency = stockUrgency(item.daysRemaining);
  const fieldId = `days__${item.productId}`;

  return (
    <Card.Root className="p-[12px]">
      <div className="flex h-full flex-col gap-[10px]">
        <div className="flex flex-col gap-[4px]">
          <Title variant="body-sm" weight="semibold" className="break-words">
            {item.productName}
          </Title>
          <Title variant="body-xs" color="muted">
            {item.factoryName}
          </Title>
          {item.lastPurchaseDate ? (
            <Title variant="body-xs" color="muted">
              Última compra em {formatDate(item.lastPurchaseDate)}
            </Title>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-[8px]">
          <Badge color={urgency.tone} size="xs">
            <Badge.Text>{urgency.label}</Badge.Text>
          </Badge>

          <div className="flex items-center gap-[8px]">
            <label htmlFor={fieldId} className="shrink-0">
              <Title variant="body-xs" color="muted">
                Ainda dura
              </Title>
            </label>
            <input
              id={fieldId}
              name={fieldId}
              type="number"
              inputMode="numeric"
              min={0}
              max={365}
              placeholder="—"
              // Alto de propósito: é um alvo de toque, preenchido em pé no
              // balcão. 16px no texto também evita o zoom automático do Safari
              // no iPhone ao focar um campo.
              className="h-[44px] w-full min-w-[60px] rounded-[8px] border border-(--border) bg-(--bg2) px-[8px] text-center text-[16px] text-(--text)"
            />
            <Title variant="body-xs" color="muted" className="shrink-0">
              dias
            </Title>
          </div>
        </div>
      </div>
    </Card.Root>
  );
}
