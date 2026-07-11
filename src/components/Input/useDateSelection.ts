import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import type { InputDateProps } from "./InputDate";

interface UseDateSelectionArgs {
  value: InputDateProps["value"];
  variant: "single" | "range";
  onChange: InputDateProps["onChange"];
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * Estado e regras de seleção de data (single e range) do InputDate: mantém o
 * valor interno, sincroniza com o `value` controlado (nunca com o popup aberto,
 * senão um re-render do pai apagaria a seleção parcial do range) e formata o
 * texto de exibição. A seleção de range é de dois cliques deliberada.
 */
export function useDateSelection({
  value,
  variant,
  onChange,
  open,
  setOpen,
}: UseDateSelectionArgs) {
  const [internalSingle, setInternalSingle] = useState<Date | undefined>(
    value instanceof Date ? value : undefined
  );
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(
    value && !(value instanceof Date) ? value : undefined
  );

  // Sincroniza props → estado interno, mas nunca com o popup aberto: um
  // re-render do pai entre os cliques do range apagaria a seleção parcial.
  useEffect(() => {
    if (open) return;
    if (variant === "single") {
      setInternalSingle(value instanceof Date ? value : undefined);
    } else {
      setInternalRange(value && !(value instanceof Date) ? value : undefined);
    }
  }, [value, variant, open]);

  const handleSelectSingle = (date: Date | undefined) => {
    setInternalSingle(date);
    onChange?.(date);
    if (date) setOpen(false);
  };

  const applyRange = (range: DateRange) => {
    setInternalRange(range);
    onChange?.(range);
    setOpen(false);
  };

  // Seleção de dois cliques via `triggerDate`. Ignoramos a auto-extensão do
  // react-day-picker (addToRange), que completaria o range num único clique
  // quando ambos os extremos já existem — isso quebra a UX "clica início, clica
  // fim". O popup fica aberto após completar; o pai confirma no fechamento.
  const handleSelectRange = (
    _range: DateRange | undefined,
    triggerDate: Date | undefined
  ) => {
    if (!triggerDate) return;

    const hasPendingFrom = !!internalRange?.from && !internalRange.to;

    if (!hasPendingFrom) {
      setInternalRange({ from: triggerDate, to: undefined });
      return;
    }

    const from = internalRange!.from!;
    const isBackwards = triggerDate.getTime() < from.getTime();
    const completed: DateRange = {
      from: isBackwards ? triggerDate : from,
      to: isBackwards ? from : triggerDate,
    };
    setInternalRange(completed);
    onChange?.(completed);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (variant === "single") setInternalSingle(undefined);
    else setInternalRange(undefined);
    onChange?.(null);
  };

  const formatDisplay = (): string => {
    if (variant === "single") {
      return internalSingle ? format(internalSingle, "dd/MM/yyyy") : "";
    }
    if (!internalRange?.from) return "";
    if (!internalRange.to) return format(internalRange.from, "dd/MM/yyyy");
    return `${format(internalRange.from, "dd/MM/yyyy")} - ${format(
      internalRange.to,
      "dd/MM/yyyy"
    )}`;
  };

  const hasValue =
    variant === "single" ? !!internalSingle : !!internalRange?.from;

  return {
    internalSingle,
    internalRange,
    handleSelectSingle,
    applyRange,
    handleSelectRange,
    handleClear,
    hasValue,
    displayValue: formatDisplay(),
  };
}
