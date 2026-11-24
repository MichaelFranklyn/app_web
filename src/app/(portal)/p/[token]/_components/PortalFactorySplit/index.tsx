import { Card } from "@/components/Card";
import { Progress } from "@/components/Progress";
import { Title } from "@/components/Title";
import { CHART_PALETTE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import { PortalFactoryTotal } from "../../interface";
import { formatPercentPoints } from "@/utils/format/percent";

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
    <Card.Root className="h-auto">
      <Card.Header>
        <Card.Header.Title>Compras por fábrica</Card.Header.Title>
        <Card.Header.Description>
          Desde o começo do seu histórico.
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-12">
          {factories.map((factory, index) => {
            const share = (Number(factory.amount) / total) * 100;
            return (
              <div key={factory.factoryName} className="flex flex-col gap-6">
                <div className="flex items-baseline justify-between gap-12">
                  <Title variant="body-sm" className="min-w-0 break-words">
                    {factory.factoryName}
                  </Title>
                  <Title
                    variant="body-sm"
                    weight="semibold"
                    className="shrink-0"
                  >
                    {formatMoney(factory.amount)}
                  </Title>
                </div>
                {/* Cantos quase retos (`square`): numa barra de 8px a cápsula
                  come as pontas e uma fatia pequena vira um grão afilado. */}
                <Progress.Bar
                  value={Math.max(share, 2)}
                  fillColor={CHART_PALETTE[index % CHART_PALETTE.length]}
                  shape="square"
                  className="h-[8px]"
                  label={`${factory.factoryName}: ${formatPercentPoints(share)} das compras`}
                />
                <Title variant="body-xs" color="muted">
                  {formatPercentPoints(share)} das compras ·{" "}
                  {factory.orderCount === 1
                    ? "1 pedido"
                    : `${factory.orderCount} pedidos`}
                </Title>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
