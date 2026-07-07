"use client";

import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { useInView } from "@/hooks/useInView";
import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Card de gráfico com lazy-load por scroll: enquanto o card não entra na
 * viewport, mostra um skeleton e NÃO monta o gráfico (a query dele só dispara
 * ao aparecer). `once` garante que, uma vez montado, não desmonta ao rolar.
 */
export function LazyChartCard({ title, description, children }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          {title}
        </Card.Header.Title>
        {description && (
          <Card.Header.Description>{description}</Card.Header.Description>
        )}
      </Card.Header>
      <Card.Body>
        <div ref={ref}>
          {inView ? (
            children
          ) : (
            <Loading.Skeleton className="h-[300px] w-full" />
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
