"use client";

import { Alert } from "@/components/Alert";
import { QueryError } from "@/components/QueryError";
import { useQuery } from "@apollo/client/react";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";

import { useClientRoute } from "../context";
import { ProductAnalysisSummary } from "./_components/ProductAnalysisSummary";
import { ProductAnalysisTable } from "./_components/ProductAnalysisTable";
import { ProductsSkeleton } from "./_components/ProductsSkeleton";
import { CLIENT_PRODUCT_ANALYSIS_QUERY } from "./gql";
import { ClientProductAnalysisQueryResponse } from "./interface";
import { useProductAnalysisTable } from "./useProductAnalysisTable";
import { summarizeAnalysis } from "./utils";
import { ICON_SIZE } from "@/components/Icon";

export default function ProductsContent() {
  const { companyClientId } = useClientRoute();
  const [months, setMonths] = useState(24);

  const { data, loading, error, refetch } =
    useQuery<ClientProductAnalysisQueryResponse>(
      CLIENT_PRODUCT_ANALYSIS_QUERY,
      {
        variables: { companyClientId, months },
        skip: !companyClientId,
      }
    );

  const rows = useMemo(() => data?.clientProductAnalysis ?? [], [data]);
  const table = useProductAnalysisTable(rows);
  // Somado aqui, sobre a mesma lista que a tabela mostra: um total vindo de
  // outra consulta é um total que pode discordar do que está na tela.
  const summary = useMemo(() => summarizeAnalysis(rows), [rows]);

  if (loading && rows.length === 0) return <ProductsSkeleton />;
  if (error && rows.length === 0)
    return <QueryError onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-16">
      <Alert.Root variant="info">
        <Info size={ICON_SIZE.sm} className="mt-1 shrink-0" />
        <Alert.Content>
          <Alert.Description>
            Esta leitura sai dos pedidos já fechados deste cliente. O ritmo de
            compra é o dele: por isso &quot;atrasado&quot; quer dizer atrasado
            para ELE, não para a média da carteira.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <ProductAnalysisSummary data={summary} />

      <ProductAnalysisTable
        table={table}
        rows={rows}
        months={months}
        onMonthsChange={setMonths}
      />
    </div>
  );
}
