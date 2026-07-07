"use client";

import { Title } from "@/components/Title";
import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Bloco de seção da aba de análises: título + subtítulo e o conteúdo (grid). */
export function AnalyticsSection({ title, description, children }: Props) {
  return (
    <section className="mt-24 first:mt-0">
      <div className="mb-12">
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
  );
}
