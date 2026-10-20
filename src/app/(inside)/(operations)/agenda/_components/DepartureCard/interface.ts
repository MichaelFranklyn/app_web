export type DepartureMode = "home" | "custom";

export interface UpdateDayDepartureResponse {
  updateVisitScheduleDay?: {
    status: boolean;
    message: string;
    data?: {
      id: string;
      departureType: string;
      departureAddress: string | null;
    } | null;
  };
}

export interface DepartureCardProps {
  dayId: string;
  /** Tipo de partida atual do dia: "HOME" | "CUSTOM" | "GPS". */
  departureType: string;
  /** Endereço de partida resolvido (casa do vendedor quando HOME). */
  departureAddress: string | null;
  /** Só o dono da rotina (vendedor) altera a origem; gestor apenas visualiza. */
  canEdit: boolean;
  /** Dispara refetch da rota após salvar (o backend reordena as paradas). */
  onChanged: () => void;
}

export interface DepartureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayId: string;
  departureType: string;
  departureAddress: string | null;
  onChanged: () => void;
}
