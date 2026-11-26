"use client";
import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { FilterField } from "@/components/Filters";
import { QueryFilter } from "@/hooks/useTableData";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { ReportOrder } from "@/utils/pdf/context";
import { useUserData } from "@/hooks/useUserData";
import { isAdminRole } from "@/utils/auth/roles";
import { Info } from "lucide-react";

import { PlanLimitGate } from "@/components/PlanLimitGate";
import { pluralWord } from "@/utils/format/plural";
import { Client, ClientsStats } from "../../interface";
import { KPI_IGNORED_FILTERS, buildKpis, listFilters } from "../../utils";
import { AddClientModal } from "./AddClientModal";
import { ExportClientsButton } from "./ExportClientsButton";
import { ClientsMoreMenu } from "./ClientsMoreMenu";
import { ICON_SIZE } from "@/components/Icon";

interface ClientsHeaderProps {
  stats: ClientsStats;
  onAddOptimistic: (client: Client) => void;
  /** Filtros ativos na tela — o export baixa o mesmo recorte que está à vista. */
  inputValues: Record<string, string>;
  /** Campos do painel de filtros, para o PDF escrever o recorte por extenso. */
  filterFields: FilterField[];
  /** Recorte do lote de importação ("Ver clientes novos"), fora do painel. */
  importFilters?: QueryFilter[];
  /** A linha do recorte do lote no PDF. */
  scopeLabel?: string | null;
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
  importFilters,
  scopeLabel,
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
            <PanelHeader.Actions data-tour="clients-actions">
              <ExportClientsButton
                inputValues={inputValues}
                filterFields={filterFields}
                importFilters={importFilters}
                scopeLabel={scopeLabel}
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

      {/* Três cartões numa linha a partir do tablet (colunas pelo padrão da
          faixa, `Card.Kpi.Group`). */}
      <Card.Kpi.Group>
        {kpis.map(({ label, value, delta, status, help }) => (
          <Card.Kpi key={label}>
            {/* Os cartões medem coisas diferentes que soam iguais (na
                  carteira × atrasado para comprar × sem visita): sem a
                  explicação ao lado, um parece contradizer o outro. */}
            <Card.Kpi.Label help={help}>{label}</Card.Kpi.Label>
            <Card.Kpi.Value status={status}>{value}</Card.Kpi.Value>
            {/* Sem seta de tendência: nenhum destes números é série no
                  tempo, e a seta para baixo sugeria uma queda que não houve. */}
            <Card.Kpi.Delta>{delta}</Card.Kpi.Delta>
          </Card.Kpi>
        ))}
      </Card.Kpi.Group>

      {/* O aviso só aparece quando ele é necessário — com a carteira inteira à
          vista, os cartões e a lista contam a mesma coisa e não há o que
          explicar. Escrito na tela, e não só no "?": quem filtra por rede e vê
          o total continuar igual conclui que a conta furou antes de procurar
          uma interrogação. */}
      {ignoredFilters.length > 0 && (
        <Alert.Root variant="info">
          <Info size={ICON_SIZE.sm} className="mt-1 shrink-0" />
          <Alert.Content>
            <Alert.Description>
              {`${listFilters(ignoredFilters)} ${pluralWord(
                ignoredFilters.length,
                "filtra",
                "filtram"
              )} apenas a lista abaixo — os cartões acima continuam contando a carteira inteira.`}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
}
