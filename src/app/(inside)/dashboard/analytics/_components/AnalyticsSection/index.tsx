"use client";

import { Title } from "@/components/Title";
import { ReactNode, useMemo } from "react";

import { AnalyticsSectionContext } from "../../analyticsSectionContext";

interface Props {
  title: string;
  description?: string;
  /**
   * Âncora da parte (ver ANALYTICS_STORY em storyParts.ts). O roteiro no topo da
   * página aponta para cá.
   */
  id?: string;
  /** Posição na história ("Parte 3 de 7") — dá noção de onde a leitura está. */
  step?: string;
  children: ReactNode;
}

/**
 * Uma parte da história das análises: onde a leitura está, o que esta parte
 * responde e os gráficos que respondem.
 *
 * O `step` existe porque a página é longa: sem ele, o usuário não sabe se está no
 * começo ou no fim, e cada seção parece um bloco solto em vez de um capítulo.
 */
export function AnalyticsSection({
  title,
  description,
  id,
  step,
  children,
}: Props) {
  // Publica a parte para os cards de dentro — quem usa é o PDF, que separa os
  // gráficos por parte da história (ver analyticsSectionContext).
  const sectionValue = useMemo(
    () => ({ title, step: step ?? "" }),
    [title, step]
  );

  return (
    <AnalyticsSectionContext.Provider value={sectionValue}>
      <section id={id} className="mt-24 scroll-mt-24 first:mt-0">
        <div className="mb-12">
          {step && (
            <Title variant="body-xs" color="muted" weight="semibold">
              {step}
            </Title>
          )}
          <Title variant="heading-sm" weight="semibold">
            {title}
          </Title>
          {description && (
            <Title variant="body-sm" color="muted">
              {description}
            </Title>
          )}
        </div>
        {children}
      </section>
    </AnalyticsSectionContext.Provider>
  );
}
