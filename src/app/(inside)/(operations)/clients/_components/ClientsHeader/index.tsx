"use client";
import { Button } from "@/components/Button";

import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { FilterField } from "@/components/Filters";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";
import { ReportOrder } from "@/utils/pdf/context";
import { useUserData } from "@/hooks/useUserData";
import { isAdminRole } from "@/utils/auth/roles";
import { Eraser, Info, Network, TrendingDown, TrendingUp } from "lucide-react";

import { PlanLimitGate } from "@/components/PlanLimitGate";
import { FeatureGate } from "@/components/FeatureGate";
import { Client, ClientsStats } from "../../interface";
import { KPI_IGNORED_FILTERS, buildKpis, listFilters } from "../../utils";
import { AddClientModal } from "./AddClientModal";
import { ExportClientsButton } from "./ExportClientsButton";
import { ImportClientsModal } from "./ImportClientsModal";

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
}

export function ClientsHeader({
  stats,
  onAddOptimistic,
  inputValues,
  filterFields,
  order,
  hasClients,
}: ClientsHeaderProps) {
  const kpis = buildKpis(stats);
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
            <PanelHeader.Title>Clientes</PanelHeader.Title>
            <PanelHeader.Description>
              Carteira de clientes da empresa. Dados globais complementados com
              informações privadas.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-6" data-tour="clients-actions">
              <ExportClientsButton
                inputValues={inputValues}
                filterFields={filterFields}
                order={order}
                disabled={!hasClients}
              />
              {/* Redes não têm item próprio na sidebar: são um recorte da
                  carteira, e é daqui que se chega nelas. Link precisa ser <a>,
                  não <button> — mesma solução do ContactLinks. */}
              <Button.Link
                href="/clients/networks"
                appearance="outline"
                color="neutral"
                size="sm"
                noUppercase
              >
                <Button.Icon icon={Network} />
                <Button.Title>Redes</Button.Title>
              </Button.Link>
              {canClean && (
                <Button.Link
                  href="/clients/hygiene"
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  noUppercase
                  title="Revisar clientes que fecharam, pararam de comprar ou mudaram de nome"
                >
                  <Button.Icon icon={Eraser} />
                  <Button.Title>Higienizar carteira</Button.Title>
                </Button.Link>
              )}
              {/* Importação em massa é recurso de plano. */}
              <FeatureGate feature="BULK_IMPORT">
                <ImportClientsModal />
              </FeatureGate>
              <PlanLimitGate limit="CLIENTS">
                <AddClientModal onAddOptimistic={onAddOptimistic} />
              </PlanLimitGate>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={20}>
        {kpis.map(
          ({
            label,
            value,
            delta,
            positive,
            negative,
            status,
            valueClassName,
            help,
          }) => (
            <Grid.Item key={label}>
              <Card.Kpi>
                {/* Os quatro cartões medem coisas diferentes que soam iguais
                    (marcado como ativo × atrasado para comprar × sem visita):
                    sem a explicação ao lado, um parece contradizer o outro. */}
                <Card.Kpi.Label className="inline-flex items-center gap-2">
                  {label}
                  {help && (
                    <HelpTooltip label={`Sobre ${label}`} content={help} />
                  )}
                </Card.Kpi.Label>
                <Card.Kpi.Value status={status} className={valueClassName}>
                  {value}
                </Card.Kpi.Value>
                <Card.Kpi.Delta positive={positive} negative={negative}>
                  {positive && <TrendingUp size={12} />}
                  {negative && <TrendingDown size={12} />}
                  {delta}
                </Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>
          )
        )}
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
              } apenas a lista abaixo — os quatro cartões acima continuam contando a carteira inteira.`}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
}
