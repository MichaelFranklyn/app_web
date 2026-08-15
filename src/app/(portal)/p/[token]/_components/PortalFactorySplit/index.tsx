import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { CHART_PALETTE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import { PortalFactoryTotal } from "../../interface";

interface PortalFactorySplitProps {
  factories: PortalFactoryTotal[];
  totalAmount: string;
}

/**
 * Quanto de cada fábrica, em barras de proporção — não em rosca.
 *
 * A rosca obriga a comparar ângulos e a voltar na legenda para saber de quem é
 * cada fatia. A barra horizontal traz o nome, o valor e o tamanho na mesma
 * linha, e continua legível na largura de um celular. Some quando há uma
 * fábrica só: uma barra de 100% não informa nada.
 */
export function PortalFactorySplit({
  factories,
  totalAmount,
}: PortalFactorySplitProps) {
  const total = Number(totalAmount);
  if (factories.length < 2 || total <= 0) return null;

  return (
    <Card.Root className="h-auto p-[16px]">
      <div className="mb-[12px] flex flex-col gap-[2px]">
        <Title variant="heading-sm">Compras por fábrica</Title>
        <Title variant="body-xs" color="muted">
          Desde o começo do seu histórico.
        </Title>
      </div>

      <div className="flex flex-col gap-[12px]">
        {factories.map((factory, index) => {
          const share = (Number(factory.amount) / total) * 100;
          return (
            <div key={factory.factoryName} className="flex flex-col gap-[6px]">
              <div className="flex items-baseline justify-between gap-[12px]">
                <Title variant="body-sm" className="min-w-0 break-words">
                  {factory.factoryName}
                </Title>
                <Title variant="body-sm" weight="semibold" className="shrink-0">
                  {formatMoney(factory.amount)}
                </Title>
              </div>
              {/* Cantos quase retos, e não `rounded-full`: numa barra de 8px de
                  altura a cápsula come 4px de cada ponta, e uma fatia pequena
                  vira um grão afilado que não dá para comparar com as outras. O
                  raio de 2px arredonda sem tirar comprimento. */}
              <div
                className="h-[8px] w-full overflow-hidden rounded-[2px] bg-(--bg3)"
                role="presentation"
              >
                <div
                  className="h-full rounded-[2px]"
                  style={{
                    width: `${Math.max(share, 2)}%`,
                    backgroundColor:
                      CHART_PALETTE[index % CHART_PALETTE.length],
                  }}
                />
              </div>
              <Title variant="body-xs" color="muted">
                {share.toFixed(0)}% das compras ·{" "}
                {factory.orderCount === 1
                  ? "1 pedido"
                  : `${factory.orderCount} pedidos`}
              </Title>
            </div>
          );
        })}
      </div>
    </Card.Root>
  );
}
