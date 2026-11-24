"use client";
import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { FilterField } from "@/components/Filters";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { ReportOrder } from "@/utils/pdf/context";
import { useUserData } from "@/hooks/useUserData";
import { isAdminRole } from "@/utils/auth/roles";
import { Info } from "lucide-react";

import { PlanLimitGate } from "@/components/PlanLimitGate";
import { Client, ClientsStats } from "../../interface";
import { KPI_IGNORED_FILTERS, buildKpis, listFilters } from "../../utils";
import { AddClientModal } from "./AddClientModal";
import { ExportClientsButton } from "./ExportClientsButton";
import { ClientsMoreMenu } from "./ClientsMoreMenu";

interface ClientsHeaderProps {
  stats: ClientsStats;
  onAddOptimistic: (client: Client) => void;
  /** Filtros ativos na tela — o export baixa o mesmo recorte que está à vista. */
  inputValues: Record<string, string>;
  /** Campos do painel de filtros, para o PDF escrever o recorte por extenso. */
  filterFields: FilterField[];
  /** Ordenação à vista na tabela — o arquivo sai na mesma ordem. */
  order?: ReportOrder | null;
  hasClients: boolean;
  /**
   * Vendedor logado: a carteira na tela é só a dele. Os textos dizem "sua
   * carteira" — "da empresa" sobre números que eram só dele confundia.
   */
  isOwnWallet: boolean;
}

export function ClientsHeader({
  stats,
  onAddOptimistic,
  inputValues,
  filterFields,
  order,
  hasClients,
  isOwnWallet,
}: ClientsHeaderProps) {
  const kpis = buildKpis(stats, isOwnWallet);
  // Os nomes, e não as chaves: o aviso repete o rótulo que a pessoa acabou de
  // usar no painel ("Rede", "Estado"), senão ela não liga um ao outro.
  const ignoredFilters = KPI_IGNORED_FILTERS(filterFields, inputValues);
  // A higienização mexe no que a empresa atende: é decisão de gestor.
  const { userData } = useUserData();
  const canClean = isAdminRole(userData?.role);

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.clients}>
              Clientes
            </PanelHeader.Heading>
            {/* Dizia "Dados globais complementados com informações privadas" —
                o modelo de dados, não o que a pessoa faz aqui (crítica de
                23/11/2026). */}
            <PanelHeader.Description>
              {isOwnWallet
                ? "Os clientes que você atende."
                : "Os clientes que sua empresa atende."}{" "}
              Clique em um para ver compras, visitas e score.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6" data-tour="clients-actions">
              <ExportClientsButton
                inputValues={inputValues}
                filterFields={filterFields}
                order={order}
                disabled={!hasClients}
              />
              {/* Redes, Higienizar e Importar moram no menu: com os cinco
                  botões à vista, no celular a carteira só começava na segunda
                  tela (crítica de 23/11/2026). */}
              <ClientsMoreMenu canClean={canClean} />
              <PlanLimitGate limit="CLIENTS">
                <AddClientModal onAddOptimistic={onAddOptimistic} />
              </PlanLimitGate>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* Três cartões numa linha a partir do tablet. Eram quatro em 2×2 até
          1600px: no desktop comum cada número ocupava meia largura e a lista
          só começava a 600px do topo. No celular o tamanho da carteira ocupa a
          linha toda e os dois alertas dividem a de baixo (crítica de
          23/11/2026). */}
      <Grid.Root cols={{ base: 2, tablet: 3 }} gap={20}>
        {kpis.map(({ label, value, delta, status, help }, index) => (
          <Grid.Item
            key={label}
            span={index === 0 ? { base: 2, tablet: 1 } : undefined}
          >
            <Card.Kpi>
              {/* Os cartões medem coisas diferentes que soam iguais (na
                  carteira × atrasado para comprar × sem visita): sem a
                  explicação ao lado, um parece contradizer o outro. */}
              <Card.Kpi.Label className="inline-flex items-center gap-2">
                {label}
                {help && (
                  <HelpTooltip label={`Sobre ${label}`} content={help} />
                )}
              </Card.Kpi.Label>
              <Card.Kpi.Value status={status}>{value}</Card.Kpi.Value>
              {/* Sem seta de tendência: nenhum destes números é série no
                  tempo, e a seta para baixo sugeria uma queda que não houve. */}
              <Card.Kpi.Delta>{delta}</Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>
        ))}
      </Grid.Root>

      {/* O aviso só aparece quando ele é necessário — com a carteira inteira à
          vista, os cartões e a lista contam a mesma coisa e não há o que
          explicar. Escrito na tela, e não só no "?": quem filtra por rede e vê
          o total continuar igual conclui que a conta furou antes de procurar
          uma interrogação. */}
      {ignoredFilters.length > 0 && (
        <Alert.Root variant="info">
          <Info size={14} className="mt-[1px] shrink-0" />
          <Alert.Content>
            <Alert.Description>
              {`${listFilters(ignoredFilters)} ${
                ignoredFilters.length === 1 ? "filtra" : "filtram"
              } apenas a lista abaixo — os cartões acima continuam contando a carteira inteira.`}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
}
