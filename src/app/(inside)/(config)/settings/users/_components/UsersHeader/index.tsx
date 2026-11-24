"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
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
import { ImportSellersModal } from "../../../_components/ImportSellersModal";
import { AddUserModal } from "./AddUserModal";

// Página larga; o teto de páginas é o do app inteiro (`MAX_SCAN_PAGES`).
const EXPORT_PAGE_SIZE = 100;
import { MAX_SCAN_PAGES } from "@/utils/pagination";
import { plural } from "@/utils/format/plural";
import { buildKpis } from "./utils";
import { ICON_SIZE } from "@/components/Icon";

interface Props {
  stats: SellersStats;
  onAddOptimistic: (user: User) => void;
  /** Busca ativa na tela — o arquivo sai com o mesmo recorte que está à vista. */
  search: string;
  /** Quantas pessoas o recorte tem ao todo, para o aviso de "nada a exportar". */
  totalItems: number;
  /** Depois de importar vendedores por planilha: lista e cartões recarregam. */
  onImported: () => void;
}

export function UsersHeader({
  stats,
  onAddOptimistic,
  search,
  totalItems,
  onImported,
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

    for (let page = 0; page < MAX_SCAN_PAGES; page++) {
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

      // A tela já sabe quantas pessoas o recorte tem: se o arquivo saiu com
      // menos, a varredura parou no teto e o silêncio faria a equipe parecer
      // menor do que é — que é o mesmo engano que este export veio corrigir.
      if (people.length < totalItems) {
        toast({
          variant: "warning",
          title: "Arquivo incompleto",
          description: `O arquivo saiu com ${people.length} de ${plural(totalItems, "pessoa", "pessoas")}. Use a busca para levar o resto.`,
        });
      }
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
            <PanelHeader.Heading {...PAGE_HEADING.users}>
              Pessoas
            </PanelHeader.Heading>
            <PanelHeader.Description>
              Quem entra no sistema e quem vende em campo — uma lista só. Clique
              em alguém para abrir o perfil completo.
            </PanelHeader.Description>
            {/* Secundários primeiro, o primário (Adicionar) por último — o
                padrão de todo cabeçalho. No celular a pilha põe o primário no
                topo sozinha (globals.css, "onde fica o primário"). */}
            <PanelHeader.Actions data-tour="users-actions">
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
              {/* A planilha só cria vendedores: o teto é o de vendedores. */}
              <PlanLimitGate limit="SELLERS">
                <ImportSellersModal onImported={onImported} />
              </PlanLimitGate>
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
      <Card.Kpi.Group>
        {kpis.map(
          ({ label, value, delta, positive, negative, status, help }) => (
            <Card.Kpi key={label}>
              {/* Login e perfil de campo são coisas diferentes, e os três
                    cartões misturam pessoas com permissões: sem a explicação ao
                    lado, um parece contradizer o outro. */}
              <Card.Kpi.Label help={help}>{label}</Card.Kpi.Label>
              <Card.Kpi.Value status={status}>{value}</Card.Kpi.Value>
              <Card.Kpi.Delta positive={positive} negative={negative}>
                {positive && <TrendingUp size={ICON_SIZE.xs} />}
                {negative && <TrendingDown size={ICON_SIZE.xs} />}
                {delta}
              </Card.Kpi.Delta>
            </Card.Kpi>
          )
        )}
      </Card.Kpi.Group>

      {/* Só quando é necessário: sem busca, cartões e lista falam da mesma
          empresa e não há o que explicar. Escrito na tela, e não só no "?" —
          quem procura um nome e vê os números parados conclui que travou. */}
      {search.trim() !== "" && (
        <Alert.Root variant="info">
          <Info size={ICON_SIZE.sm} className="mt-1 shrink-0" />
          <Alert.Content>
            <Alert.Description>{KPI_IGNORES_SEARCH}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
}
