"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { CalendarClock, PackageSearch, Pencil } from "lucide-react";
import { useState } from "react";
import { VisitScheduleItem } from "../../interface";
import { EditVisitModal } from "./EditVisitModal";
import { RescheduleVisitModal } from "./RescheduleVisitModal";
import { StockVisitModal } from "./StockVisitModal";

type ActiveModal = "edit" | "stock" | "reschedule" | null;

interface Props {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: { id: string; date: string }[];
  onChanged: () => void;
}

export function VisitActions({
  item,
  currentDayId,
  scheduleDays,
  onChanged,
}: Props) {
  const [active, setActive] = useState<ActiveModal>(null);
  const close = () => setActive(null);

  return (
    <>
      <MoreOptions
        options={[
          {
            label: "Editar visita",
            icon: Pencil,
            onClick: () => setActive("edit"),
          },
          {
            label: "Estoque do cliente",
            icon: PackageSearch,
            onClick: () => setActive("stock"),
          },
          {
            label: "Remarcar visita",
            icon: CalendarClock,
            onClick: () => setActive("reschedule"),
          },
        ]}
      />

      <EditVisitModal
        item={item}
        open={active === "edit"}
        onOpenChange={(o) => !o && close()}
        onDone={onChanged}
      />

      <StockVisitModal
        item={item}
        open={active === "stock"}
        onOpenChange={(o) => !o && close()}
      />

      <RescheduleVisitModal
        item={item}
        currentDayId={currentDayId}
        scheduleDays={scheduleDays}
        open={active === "reschedule"}
        onOpenChange={(o) => !o && close()}
        onDone={onChanged}
      />
    </>
  );
}
