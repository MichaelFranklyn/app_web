import { SampleRow } from "@/components/SampleRow";
import { Title } from "@/components/Title";

import { PendingItem } from "../../interface";
import { clientDetail, dueLabel, dueTone } from "../../utils";

/**
 * Uma das pendências mais urgentes do assunto: de quem é, o complemento que a
 * identifica (fábrica e valor, em pedido e boleto) e o prazo — vermelho só
 * quando o atraso já é de prioridade Alta. O motivo completo fica na lista.
 */
export function PendingSampleRow({ sample }: { sample: PendingItem }) {
  return (
    <SampleRow
      label={sample.clientName}
      detail={clientDetail(sample)}
      href={sample.link}
      aside={
        <Title
          variant="body-xs"
          color={dueTone(sample.daysLate, sample.priority)}
        >
          {dueLabel(sample.daysLate, sample.type)}
        </Title>
      }
    />
  );
}
