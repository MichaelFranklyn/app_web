import { SelectOption } from "@/components/Input/InputSelect";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { VisitScheduleDay } from "../../interface";
import {
  CREATE_VISIT_DAY_MUTATION,
  CREATE_VISIT_ITEM_MUTATION,
  SELLER_CLIENT_LINKS_QUERY,
} from "./gql";
import {
  CreateVisitDayResponse,
  CreateVisitItemResponse,
  SellerClientLinksQueryData,
} from "./interface";

const clientLabel = (
  client: { nomeFantasia: string | null; razaoSocial: string } | null
): string => client?.nomeFantasia ?? client?.razaoSocial ?? "Cliente";

interface Params {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: VisitScheduleDay | null;
  date: string;
  scheduleId: string;
  nextDay: VisitScheduleDay | null;
  sellerId: string;
  maxVisitsPerDay: number;
  onDone: () => void;
}

export function useAddVisit({
  open,
  onOpenChange,
  day,
  date,
  scheduleId,
  nextDay,
  sellerId,
  maxVisitsPerDay,
  onDone,
}: Params) {
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  // Passa para a etapa de confirmação quando o dia já está no limite.
  const [confirmingOverLimit, setConfirmingOverLimit] = useState(false);

  const linksQuery = useQuery<SellerClientLinksQueryData>(
    SELLER_CLIENT_LINKS_QUERY,
    {
      variables: {
        input: {
          first: 500,
          filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
        },
      },
      skip: !open,
    }
  );

  const [createVisitItem] = useMutation<CreateVisitItemResponse>(
    CREATE_VISIT_ITEM_MUTATION
  );
  const [createVisitDay] = useMutation<CreateVisitDayResponse>(
    CREATE_VISIT_DAY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Reseta o estado sempre que o modal abre.
  useEffect(() => {
    if (open) {
      setSelectedLinkId(null);
      setConfirmingOverLimit(false);
    }
  }, [open]);

  // Folga: o dia ainda não existe na rotina; será criado antes de agendar.
  const isFolga = !day;

  // Vínculos já agendados neste dia não podem ser adicionados de novo.
  const scheduledLinkIds = useMemo(
    () =>
      new Set(
        (day?.items ?? [])
          .map((i) => i.clientFactoryLink?.id)
          .filter((id): id is string => Boolean(id))
      ),
    [day]
  );

  const options: SelectOption[] = useMemo(() => {
    const nodes = linksQuery.data?.seller_client_links.edges.map((e) => e.node);
    return (nodes ?? [])
      .filter((n) => !scheduledLinkIds.has(n.id))
      .map((n) => ({ value: n.id, label: clientLabel(n.client) }));
  }, [linksQuery.data, scheduledLinkIds]);

  const isDayFull = day ? day.items.length >= maxVisitsPerDay : false;
  const nextDayHasRoom = Boolean(
    nextDay && nextDay.items.length < maxVisitsPerDay
  );

  // Cria o item numa das opções: um dia existente, ou uma folga (cria o dia antes).
  const runCreate = (target: "current" | "next") =>
    execute(
      async () => {
        let scheduleDayId: string;
        let plannedOrder: number;

        if (target === "next" && nextDay) {
          scheduleDayId = nextDay.id;
          plannedOrder = nextDay.items.length + 1;
        } else if (day) {
          scheduleDayId = day.id;
          plannedOrder = day.items.length + 1;
        } else {
          // Folga: cria o dia vazio (partida = casa, igual à geração automática).
          const dayRes = await createVisitDay({
            variables: {
              input: { scheduleId, date, departureType: "HOME" },
            },
          });
          const dayPayload = dayRes.data?.createVisitScheduleDay;
          if (!dayPayload?.status || !dayPayload.data) {
            throw new Error(
              dayPayload?.message ?? "Erro ao criar o dia da rotina"
            );
          }
          scheduleDayId = dayPayload.data.id;
          plannedOrder = 1;
        }

        const res = await createVisitItem({
          variables: {
            input: {
              scheduleDayId,
              sellerClientFactoryId: selectedLinkId,
              plannedOrder,
            },
          },
        });
        const payload = res.data?.createVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao agendar visita");
        }
        return payload;
      },
      {
        successMessage: "Visita agendada",
        onSuccess: () => {
          onOpenChange(false);
          onDone();
        },
      }
    );

  // Botão principal: se o dia estiver cheio, primeiro pede confirmação.
  const handlePrimary = () => {
    if (!selectedLinkId) return;
    if (isDayFull && !confirmingOverLimit) {
      setConfirmingOverLimit(true);
      return;
    }
    runCreate("current");
  };

  const handleAddToNextDay = () => {
    if (!selectedLinkId || !nextDay) return;
    runCreate("next");
  };

  return {
    options,
    optionsLoading: linksQuery.loading,
    selectedLinkId,
    setSelectedLinkId,
    confirmingOverLimit,
    isFolga,
    isDayFull,
    nextDay,
    nextDayHasRoom,
    isLoading,
    handlePrimary,
    handleAddToNextDay,
  };
}
