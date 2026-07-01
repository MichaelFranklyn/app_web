import { VisitScheduleItem } from "../../../interface";

export interface StockVisitModalProps {
  item: VisitScheduleItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}
