"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
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

/**
 * Quanto histórico olhar. Dois anos é o padrão do backend; "todo o histórico"
 * (0) existe para o cliente antigo, e 12 meses para quem quer ler só o ano
 * corrente sem o ruído do que ele comprava antes.
 */
const PERIOD_OPTIONS = [
  { label: "12 meses", value: 12 },
  { label: "2 anos", value: 24 },
  { label: "Tudo", value: 0 },
];

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
        <Info size={14} className="mt-[1px] shrink-0" />
        <Alert.Content>
          <Alert.Description>
            Esta leitura sai dos pedidos já fechados deste cliente. O ritmo de
            compra é o dele: por isso &quot;atrasado&quot; quer dizer atrasado
            para ELE, não para a média da carteira.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <ProductAnalysisSummary data={summary} />

      <div className="flex flex-wrap items-center justify-between gap-16">
        <div className="flex items-center gap-6">
          <Title variant="heading-md">O que ele compra</Title>
          <HelpTooltip
            label="Como esta análise é feita?"
            content={
              <Title variant="body-sm">
                Para cada produto, olhamos em quais pedidos ele apareceu e de
                quanto em quanto tempo o cliente o repõe. Passado esse tempo, o
                produto entra em &quot;hora de repor&quot;; muito depois dele,
                em &quot;parou de comprar&quot;.
              </Title>
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <Title variant="body-xs" color="muted" weight="medium">
            Período:
          </Title>
          {PERIOD_OPTIONS.map((opt) => {
            const active = months === opt.value;
            return (
              <Button.Root
                key={opt.value}
                type="button"
                appearance={active ? "tinted" : "outline"}
                color={active ? "amber" : "neutral"}
                size="sm"
                noUppercase
                onClick={() => setMonths(opt.value)}
              >
                <Button.Title>{opt.label}</Button.Title>
              </Button.Root>
            );
          })}
        </div>
      </div>

      <ProductAnalysisTable table={table} rows={rows} />
    </div>
  );
}
