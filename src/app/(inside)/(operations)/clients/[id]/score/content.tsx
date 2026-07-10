"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useClientRoute } from "../context";
import { CLIENT_FACTORY_SCORES_QUERY } from "../gql";
import {
  ClientFactoryScoresQueryResponse,
  FactoryVisitScore,
} from "../interface";
import { FactoryScoreGrid } from "./_components/FactoryScoreGrid";
import { FactoryScoreModal } from "./_components/FactoryScoreModal";
import { ScoreSkeleton } from "./_components/ScoreSkeleton";

export default function ScoreContent() {
  const { companyClientId } = useClientRoute();
  const [selected, setSelected] = useState<FactoryVisitScore | null>(null);

  // O cliente tem um score por fábrica, porque estoque e histórico de compra são
  // diferentes em cada uma. O backend já devolve a lista da mais quente para a
  // mais fria — o número do header é o topo dela.
  const { data, loading } = useQuery<ClientFactoryScoresQueryResponse>(
    CLIENT_FACTORY_SCORES_QUERY,
    { variables: { id: companyClientId }, skip: !companyClientId }
  );

  const scores = data?.companyClient.data?.factoryVisitScores ?? [];

  if (loading && scores.length === 0) return <ScoreSkeleton />;

  return (
    <div className="flex flex-col gap-16" data-tour="client-score">
      <div className="flex items-center gap-6">
        <Title variant="heading-md">Score por fábrica</Title>
        <HelpTooltip
          label="Por que cada fábrica tem um score?"
          content={
            <Title variant="body-sm">
              O cliente tem um score para cada fábrica que você atende, porque o
              estoque e o histórico de compra são diferentes em cada uma. Quanto
              maior o número, mais aquela fábrica precisa de visita. Toque num
              card para entender o porquê.
            </Title>
          }
        />
      </div>

      <FactoryScoreGrid scores={scores} onSelect={setSelected} />

      <FactoryScoreModal score={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
