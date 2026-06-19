"use client";

import React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarStyles } from "./styles";
import { CalendarDropdown } from "./CalendarDropdown";
import { cn } from "@/lib/utils";

export type CalendarBaseProps = DayPickerProps & { className?: string };

export const CalendarBase = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  startMonth,
  endMonth,
  ...props
}: CalendarBaseProps) => {
  const today = new Date();
  const defaultStart = new Date(today.getFullYear() - 30, 0, 1);
  const defaultEnd = new Date(today.getFullYear() + 5, 11, 31);

  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      fixedWeeks
      hideNavigation
      startMonth={startMonth ?? defaultStart}
      endMonth={endMonth ?? defaultEnd}
      className={cn(calendarStyles.wrapper, className)}
      classNames={{
        months: calendarStyles.months,
        month: calendarStyles.month,
        month_caption: calendarStyles.month_caption,
        caption_label: calendarStyles.caption_label,
        nav: calendarStyles.nav,
        button_previous: calendarStyles.button_previous,
        button_next: calendarStyles.button_next,
        month_grid: calendarStyles.month_grid,
        weekdays: calendarStyles.weekdays,
        weekday: calendarStyles.weekday,
        week: calendarStyles.week,
        dropdowns: calendarStyles.dropdowns,
        dropdown: calendarStyles.dropdown,
        months_dropdown: calendarStyles.months_dropdown,
        years_dropdown: calendarStyles.years_dropdown,
        day: calendarStyles.day,
        day_button: calendarStyles.day_button,
        selected: calendarStyles.selected,
        today: calendarStyles.today,
        outside: calendarStyles.outside,
        disabled: calendarStyles.disabled,
        range_end: calendarStyles.range_end,
        range_middle: calendarStyles.range_middle,
        range_start: calendarStyles.range_start,
        ...classNames,
      }}
      modifiersClassNames={{
        selected: calendarStyles.selected,
        today: calendarStyles.today,
        range_start: calendarStyles.range_start,
        range_middle: calendarStyles.range_middle,
        range_end: calendarStyles.range_end,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left")
            return <ChevronLeft size={16} strokeWidth={3} />;
          if (orientation === "right")
            return <ChevronRight size={16} strokeWidth={3} />;
          // CalendarDropdown renders its own indicator; suppress the extra
          // up/down chevrons react-day-picker injects next to dropdowns.
          return <></>;
        },
        Dropdown: CalendarDropdown,
      }}
      {...props}
    />
  );
};
