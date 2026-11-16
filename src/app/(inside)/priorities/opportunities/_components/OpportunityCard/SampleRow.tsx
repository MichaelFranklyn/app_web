import { SampleRow } from "@/components/SampleRow";
import { Title } from "@/components/Title";
import { CalendarCheck } from "lucide-react";

import { OpportunityCase } from "../../interface";
import { scheduledNote } from "../../utils";

/**
 * Um cliente prioritário do cartão: o nome, o dado que o coloca ali e o que já
 * está marcado para ele — a mesma regra da lista completa, para o vendedor não
 * repetir a ação já no cartão.
 */
export function OpportunitySampleRow({ sample }: { sample: OpportunityCase }) {
  const scheduled = scheduledNote(sample);

  return (
    <SampleRow label={sample.label} detail={sample.detail} href={sample.link}>
      {scheduled && (
        <Title
          variant="micro"
          color="green"
          className="flex items-center gap-4"
        >
          <CalendarCheck size={12} aria-hidden />
          {scheduled}
        </Title>
      )}
    </SampleRow>
  );
}
