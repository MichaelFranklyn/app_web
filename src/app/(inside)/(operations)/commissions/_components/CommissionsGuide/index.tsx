"use client";

import { Card } from "@/components/Card";
import { Collapse } from "@/components/Collapse";
import { Title } from "@/components/Title";
import { useState } from "react";

import { guideSections } from "../../help";

interface Props {
  /** Gestor: entram as partes que só ele vê (ótica, repartição). */
  canManage: boolean;
}

/**
 * "Como isto é calculado": a explicação da tela inteira num lugar só, fechada.
 *
 * Antes eram cerca de dez "?" espalhados — um por cartão, um por botão —, e a
 * tela de comissões virava um campo de interrogações. Quem confere o mês todo
 * dia não precisa delas; quem chega pela primeira vez prefere ler de uma vez,
 * na ordem da tela, a caçar ícone por ícone. Os "?" que sobraram estão colados
 * em uma escolha (vendedor, ótica) ou num painel que só às vezes aparece.
 */
export function CommissionsGuide({ canManage }: Props) {
  const [open, setOpen] = useState(false);
  const sections = guideSections(canManage);

  return (
    <Card.Root data-testid="commissions-guide">
      <Collapse.Header>
        <Collapse.Trigger
          variant="bar"
          open={open}
          onToggle={() => setOpen((v) => !v)}
          aria-controls="commissions-guide-body"
        >
          <div className="flex min-w-0 flex-col">
            <Title variant="body-sm" weight="semibold">
              Como isto é calculado
            </Title>
            <Title variant="body-xs" color="muted">
              O mês, os cartões, as situações, os filtros e o PDF — tudo
              explicado num lugar só.
            </Title>
          </div>
        </Collapse.Trigger>
      </Collapse.Header>
      {open && (
        <div
          id="commissions-guide-body"
          className="desktop:grid-cols-2 grid grid-cols-1 gap-x-24 gap-y-20 px-16 py-16"
        >
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-6">
              <Title variant="heading-sm">{section.title}</Title>
              {section.body}
            </section>
          ))}
        </div>
      )}
    </Card.Root>
  );
}
