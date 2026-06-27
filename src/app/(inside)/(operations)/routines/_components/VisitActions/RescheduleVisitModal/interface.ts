import { VisitScheduleItem } from "../../../interface";

export interface RescheduleVisitResponse {
  rescheduleVisit?: {
    status: boolean;
    message: string;
  };
}

export interface RescheduleVisitModalProps {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: { id: string; date: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}
