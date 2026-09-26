import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
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
 *
 * O campo é `size="lg"`, o tamanho de toque do DS: preenchido em pé no balcão,
 * e com 16px de texto o Safari do iPhone não dá zoom ao focar.
 */
export function PortalStockRow({ item }: PortalStockRowProps) {
  const urgency = stockUrgency(item.daysRemaining);
  const fieldId = `days__${item.productId}`;

  return (
    <Card.Root>
      <Card.Body padding="compact">
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

            <Input.Number
              id={fieldId}
              name={fieldId}
              label="Ainda dura quantos dias?"
              placeholder="—"
              size="lg"
              inputMode="numeric"
              min={0}
              max={365}
            />
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
