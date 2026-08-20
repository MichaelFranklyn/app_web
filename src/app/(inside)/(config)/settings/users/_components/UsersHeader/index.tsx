"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";
import { PlanLimitGate } from "@/components/PlanLimitGate";
import { useToast } from "@/components/Toast";
import { useApolloClient } from "@apollo/client/react";
import { useState } from "react";
import { downloadCSV } from "@/utils/format/csv";
import { formatDateDMY } from "@/utils/format/masks";
import { Download, Info, TrendingDown, TrendingUp } from "lucide-react";
import { KPI_IGNORES_SEARCH } from "../../help";
import { USERS_QUERY } from "../../gql";
import { SellersStats, User, UsersQueryResponse } from "../../interface";
import { ROLE_LABEL, UserRole } from "../../utils";
import { AddUserModal } from "./AddUserModal";

// Página larga e teto de segurança: o mesmo par do export da carteira.
const EXPORT_PAGE_SIZE = 100;
const MAX_PAGES = 100;
import { buildKpis } from "./utils";

interface Props {
  stats: SellersStats;
  onAddOptimistic: (user: User) => void;
  /** Busca ativa na tela — o arquivo sai com o mesmo recorte que está à vista. */
  search: string;
  /** Quantas pessoas o recorte tem ao todo, para o aviso de "nada a exportar". */
  totalItems: number;
}

export function UsersHeader({
  stats,
  onAddOptimistic,
  search,
  totalItems,
}: Props) {
  const kpis = buildKpis(stats);
  const apollo = useApolloClient();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  /**
   * Baixa TODAS as pessoas do recorte, não as que estão na tela.
   *
   * A lista pagina de dez em dez: exportar o que estava em memória dava um
   * arquivo de dez linhas numa empresa de quarenta pessoas — e sem nada
   * avisando, quem conferisse concluiria que a equipe tinha dez. Aqui a query é
   * refeita varrendo as páginas, com a mesma busca aplicada na tela.
   */
  const fetchAllUsers = async (): Promise<User[]> => {
    const filters = search
      ? [{ field: "name", operator: "like", value: search }]
      : [];
    const all: User[] = [];
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page++) {
      const result: { data?: UsersQueryResponse } =
        await apollo.query<UsersQueryResponse>({
          query: USERS_QUERY,
          variables: {
            input: {
              first: EXPORT_PAGE_SIZE,
              after,
              ...(filters.length > 0 && { filters }),
            },
          },
          fetchPolicy: "network-only",
        });

      const connection = result.data?.users_list;
      if (!connection) break;
      all.push(...connection.edges.map((edge) => edge.node));

      const { hasNextPage, endCursor } = connection.pageInfo ?? {};
      if (!hasNextPage || !endCursor) break;
      after = endCursor;
    }

    return all;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const people = await fetchAllUsers();
      if (people.length === 0) {
        toast({
          variant: "error",
          title: "Nada para exportar",
          description: "Nenhuma pessoa encontrada com a busca atual.",
        });
        return;
      }
      const headers = ["Nome", "E-mail", "Perfil", "Vende em campo", "Desde"];
      const rows = people.map((u) => [
        u.name,
        u.email,
        ROLE_LABEL[u.role as UserRole] ?? u.role,
        u.seller ? "Sim" : "Não",
        formatDateDMY(u.createdAt),
      ]);
      downloadCSV("pessoas.csv", [headers, ...rows]);
    } catch {
      toast({
        variant: "error",
        title: "Erro ao exportar",
        description: "Não foi possível baixar a lista. Tente novamente.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Pessoas</PanelHeader.Title>
            <PanelHeader.Description>
              Quem entra no sistema e quem vende em campo — uma lista só. Clique
              em alguém para abrir o perfil completo.
            </PanelHeader.Description>
            <PanelHeader.Actions className="mt-12" data-tour="users-actions">
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                disabled={totalItems === 0 || exporting}
                loading={exporting}
                onClick={handleExport}
              >
                <Button.Icon icon={Download} />
                <Button.Title>Exportar</Button.Title>
              </Button.Root>
              {/* Pelo teto de LOGINS: o papel só é escolhido dentro do modal, e
                  quem pedir vendedor sem cota de vendedor recebe a recusa da
                  própria mutation, com a frase daquele teto. */}
              <PlanLimitGate limit="USERS">
                <AddUserModal onAddOptimistic={onAddOptimistic} />
              </PlanLimitGate>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* KPIs da operação de campo: é o que muda no dia a dia. */}
      <Grid.Root cols={{ base: 1, tablet: 3 }} gap={20}>
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
                {/* Login e perfil de campo são coisas diferentes, e os três
                    cartões misturam pessoas com permissões: sem a explicação ao
                    lado, um parece contradizer o outro. */}
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

      {/* Só quando é necessário: sem busca, cartões e lista falam da mesma
          empresa e não há o que explicar. Escrito na tela, e não só no "?" —
          quem procura um nome e vê os números parados conclui que travou. */}
      {search.trim() !== "" && (
        <Alert.Root variant="info">
          <Info size={14} className="mt-[1px] shrink-0" />
          <Alert.Content>
            <Alert.Description>{KPI_IGNORES_SEARCH}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
}
