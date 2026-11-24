import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { PlatformTenant } from "../../interface";
import { tenantName } from "../../utils";

/**
 * Identidade da empresa numa coluna só: nome em cima, CNPJ e situação embaixo.
 *
 * Espalhar isso em três colunas obrigaria a tabela a rolar na horizontal, e a
 * coluna de identidade é justamente a que precisa estar sempre visível. Por
 * isso ela trunca com `max-w` em vez de empurrar as vizinhas.
 */
export function TenantCell({ tenant }: { tenant: PlatformTenant }) {
  return (
    <Table.Cell card="title" wrap>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-6">
          <Title
            variant="body-sm"
            weight="semibold"
            className="[overflow-wrap:anywhere]"
          >
            {tenantName(tenant)}
          </Title>
          {!tenant.isActive && (
            <Badge.Root color="red" appearance="tinted" size="xs">
              <Badge.Text>Suspensa</Badge.Text>
            </Badge.Root>
          )}
        </div>
        <Title
          variant="micro"
          color="muted"
          className="[overflow-wrap:anywhere]"
        >
          {tenant.cnpj}
        </Title>
      </div>
    </Table.Cell>
  );
}
