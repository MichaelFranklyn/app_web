"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/IconTile";
import { RowList } from "@/components/RowList";
import { Title } from "@/components/Title";
import { ChevronDown, ChevronUp } from "lucide-react";

import { PendingTypeCount } from "../../interface";
import {
  cardSubtitle,
  countTone,
  PENDING_TYPE_COPY,
  PENDING_TYPE_LABEL,
} from "../../utils";
import { SampleRow } from "./SampleRow";

interface Props {
  row: PendingTypeCount;
  /** A lista deste assunto está aberta na página. */
  open: boolean;
  onToggle: () => void;
}

/**
 * Um assunto da central: quantas pendências, por que aquilo espera por você,
 * as mais urgentes e o caminho para a lista inteira.
 *
 * O mesmo desenho dos cartões de Oportunidades — e a cor é o que separa as
 * duas telas: lá o número é verde (escolha comercial); aqui é vermelho quando
 * há prioridade alta e âmbar quando não, porque isto é compromisso.
 */
export function PendingTypeCard({ row, open, onToggle }: Props) {
  const copy = PENDING_TYPE_COPY[row.type];
  const Icon = copy.icon;
  const tone = countTone(row.count, row.highCount);
  const samples = row.samples ?? [];

  return (
    <Card.Root data-tour="pending-card">
      <Card.Section className="gap-12">
        <div className="flex items-start justify-between gap-12">
          <div className="flex min-w-0 items-start gap-10">
            <IconTile
              aria-hidden
              color={tone === "red" ? "red" : "amber"}
              shape="circle"
              size="md"
            >
              <Icon />
            </IconTile>
            <div className="flex min-w-0 flex-col gap-2">
              <Title variant="heading-sm">{PENDING_TYPE_LABEL[row.type]}</Title>
              <Title variant="body-xs" color="muted">
                {cardSubtitle(row)}
              </Title>
            </div>
          </div>
          <Title variant="kpi" color={tone} className="shrink-0 leading-none">
            {row.count}
          </Title>
        </div>
        <Title variant="body-sm" color="secondary">
          {copy.why}
        </Title>
      </Card.Section>

      {samples.length > 0 && (
        <Card.Section divided className="gap-6 py-12">
          <Title variant="micro" color="muted">
            Mais urgentes
          </Title>
          <RowList.Root>
            {samples.map((sample) => (
              <RowList.Item key={sample.id}>
                <SampleRow sample={sample} />
              </RowList.Item>
            ))}
          </RowList.Root>
        </Card.Section>
      )}

      {/* `mt-auto`: a ação encosta no rodapé, alinhada entre cartões. */}
      <Card.Section
        divided
        className="mt-auto flex-row flex-wrap items-center justify-end py-12"
      >
        <Button.Root
          type="button"
          appearance={open ? "tinted" : "outline"}
          color={open ? "amber" : "neutral"}
          size="sm"
          noUppercase
          aria-expanded={open}
          onClick={onToggle}
          data-tour="pending-open"
        >
          <Button.Title>
            {open ? "Fechar lista" : `${copy.listAction} (${row.count})`}
          </Button.Title>
          <Button.Icon icon={open ? ChevronUp : ChevronDown} />
        </Button.Root>
      </Card.Section>
    </Card.Root>
  );
}
