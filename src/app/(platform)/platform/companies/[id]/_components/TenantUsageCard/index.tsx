import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { activityLabel, daysSinceLogin } from "../../../../utils";
import { TenantDetail } from "../../interface";
import { limitUsage } from "../../utils";

/** Uma contagem com o teto contratado ao lado, quando existe teto. */
function CountItem({
  label,
  value,
  limit,
}: {
  label: string;
  value: number;
  limit?: number | null;
}) {
  const usage = limit !== undefined ? limitUsage(value, limit ?? null) : null;

  return (
    <div className="flex flex-col gap-[2px]">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <div className="flex items-baseline gap-6">
        <Title variant="value" weight="semibold">
          {value}
        </Title>
        {usage && (
          <Title variant="micro" color={usage.isOver ? "red" : "muted"}>
            de {limit}
            {usage.isOver && " — acima do limite"}
          </Title>
        )}
      </div>
    </div>
  );
}

export function TenantUsageCard({ tenant }: { tenant: TenantDetail }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Uso
        </Card.Header.Title>
        <Card.Header.Description>
          Contagens totais; pedidos e faturamento são dos últimos 30 dias.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <Grid.Root cols={{ base: 2, tablet: 3, "desktop-xl": 6 }} gap={12}>
          <Grid.Item>
            <CountItem
              label="Pessoas"
              value={tenant.usersCount}
              limit={tenant.maxUsers}
            />
          </Grid.Item>
          <Grid.Item>
            <CountItem
              label="Vendedores"
              value={tenant.sellersCount}
              limit={tenant.maxSellers}
            />
          </Grid.Item>
          <Grid.Item>
            <CountItem label="Clientes" value={tenant.clientsCount} />
          </Grid.Item>
          <Grid.Item>
            <CountItem label="Fábricas" value={tenant.factoriesCount} />
          </Grid.Item>
          <Grid.Item>
            <div className="flex flex-col gap-[2px]">
              <Title variant="micro" color="muted">
                Pedidos (30d)
              </Title>
              <div className="flex items-baseline gap-6">
                <Title variant="value" weight="semibold">
                  {tenant.ordersInPeriod}
                </Title>
                <Title variant="micro" color="muted">
                  de {tenant.ordersCount} no total
                </Title>
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div className="flex flex-col gap-[2px]">
              <Title variant="micro" color="muted">
                Faturamento (30d)
              </Title>
              <Title variant="value" weight="semibold">
                {formatMoney(tenant.gmvInPeriod)}
              </Title>
            </div>
          </Grid.Item>
        </Grid.Root>

        <div className="mt-16 flex flex-wrap gap-24 border-t border-(--border) pt-12">
          <div className="flex flex-col gap-[2px]">
            <Title variant="micro" color="muted">
              Último acesso
            </Title>
            <Title variant="caption">
              {activityLabel(daysSinceLogin(tenant.lastLoginAt))}
            </Title>
          </div>
          <div className="flex flex-col gap-[2px]">
            <Title variant="micro" color="muted">
              Último pedido
            </Title>
            <Title variant="caption">{formatDate(tenant.lastOrderDate)}</Title>
          </div>
          <div className="flex flex-col gap-[2px]">
            <Title variant="micro" color="muted">
              Cliente desde
            </Title>
            <Title variant="caption">{formatDate(tenant.createdAt)}</Title>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
