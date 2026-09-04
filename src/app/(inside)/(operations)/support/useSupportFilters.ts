"use client";

import { FilterField } from "@/components/Filters";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_PRIORITY_LABEL,
  SUPPORT_STATUS_LABEL,
  SupportCategory,
  SupportPriority,
  SupportStatus,
} from "@/utils/support";
import { useMemo } from "react";

const options = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));

/**
 * Os filtros da fila. As opções são FIXAS (o vocabulário do enum), e não
 * tiradas das linhas: uma situação que ninguém tem hoje precisa continuar
 * escolhível — é justamente assim que se confere que ela está vazia.
 */
export const useSupportFilters = (): FilterField[] =>
  useMemo(
    () => [
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: options<SupportStatus>(SUPPORT_STATUS_LABEL),
      },
      {
        type: "select",
        key: "category",
        label: "Tipo de problema",
        placeholder: "Todos os tipos",
        options: options<SupportCategory>(SUPPORT_CATEGORY_LABEL),
      },
      {
        type: "select",
        key: "priority",
        label: "Urgência",
        placeholder: "Todas",
        options: options<SupportPriority>(SUPPORT_PRIORITY_LABEL),
      },
    ],
    []
  );
