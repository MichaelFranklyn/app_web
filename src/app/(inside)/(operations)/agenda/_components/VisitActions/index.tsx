"use client";

import { VisitScheduleItem } from "../../interface";
import { useVisitActions } from "../../useVisitActions";

interface Props {
  item: VisitScheduleItem;
  dayDate?: string | null;
  onChanged: () => void;
}

export function VisitActions(props: Props) {
  const { menu, overlays } = useVisitActions(props);

  return (
    <>
      {overlays}
      {menu}
    </>
  );
}
