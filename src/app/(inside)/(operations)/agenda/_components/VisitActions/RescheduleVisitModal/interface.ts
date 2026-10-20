import { VisitScheduleItem } from "../../../interface";

export interface RescheduleVisitResponse {
  rescheduleVisit?: {
    status: boolean;
    message: string;
  };
}

/**
 * O que a remarcação precisa saber da visita: qual é ela e de quem.
 *
 * Não é o item inteiro de propósito — a dívida de visitas vencidas
 * (`OverdueVisitsCard`) atravessa semanas e não carrega o item completo da
 * rotina. O dia de origem e a semana em tela não entram na remarcação: o
 * destino sai da data escolhida no formulário, e o backend cria a rotina
 * daquela semana se ainda não existir.
 */
export type RescheduleTarget = Pick<
  VisitScheduleItem,
  "id" | "clientFactoryLink"
>;

export interface RescheduleVisitModalProps {
  item: RescheduleTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}
