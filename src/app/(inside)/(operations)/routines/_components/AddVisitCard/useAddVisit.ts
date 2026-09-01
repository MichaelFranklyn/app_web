import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { clientDisplayName } from "@/utils/client";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  RoutineCapacity,
  VisitContactType,
  VisitScheduleDay,
} from "../../interface";
import { CONTACT_TYPE_LABEL, contactNoun } from "@/utils/visit";
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
): string => clientDisplayName(client, "Cliente");

interface Params {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: VisitScheduleDay | null;
  date: string;
  scheduleId: string;
  nextDay: VisitScheduleDay | null;
  sellerId: string;
  capacity: RoutineCapacity;
  onDone: () => void;
}

// Quantos itens do tipo escolhido o dia já tem — o teto é por tipo, porque
// ligação não consome vaga de deslocamento.
const countByType = (
  day: VisitScheduleDay | null,
  contactType: VisitContactType
): number =>
  (day?.items ?? []).filter((i) => i.contactType === contactType).length;

// Carteira do vendedor carregada por inteiro (ver useCompleteList).
const getLinks = (d: SellerClientLinksQueryData) => d.seller_client_links;

export function useAddVisit({
  open,
  onOpenChange,
  day,
  date,
  scheduleId,
  nextDay,
  sellerId,
  capacity,
  onDone,
}: Params) {
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [contactType, setContactType] = useState<VisitContactType>("IN_PERSON");
  // Passa para a etapa de confirmação quando o dia já está no limite.
  const [confirmingOverLimit, setConfirmingOverLimit] = useState(false);

  const bySeller = useMemo(
    () => ({
      filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
    }),
    [sellerId]
  );

  const linksQuery = useCompleteList<SellerClientLinksQueryData>(
    SELLER_CLIENT_LINKS_QUERY,
    bySeller,
    getLinks,
    { skip: !open }
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
      setContactType("IN_PERSON");
      setConfirmingOverLimit(false);
    }
  }, [open]);

  // Mudar o tipo muda o teto: a confirmação de estouro precisa ser refeita
  // contra a capacidade do novo tipo, senão o aviso fica falando do teto errado.
  useEffect(() => {
    setConfirmingOverLimit(false);
  }, [contactType]);

  // O dia ainda não existe na rotina (nunca teve rota): será criado antes de
  // agendar. Não confundir com o dia NÃO TRABALHADO, que o vendedor marcou e
  // que não aceita visita nenhuma — ver `DayOffButton`.
  const isDayWithoutRoute = !day;

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

  const isRemote = contactType === "REMOTE";
  const typeLimit = isRemote
    ? capacity.maxRemoteContactsPerDay
    : capacity.maxVisitsPerDay;
  const isDayFull = day ? countByType(day, contactType) >= typeLimit : false;
  const nextDayHasRoom = Boolean(
    nextDay && countByType(nextDay, contactType) < typeLimit
  );

  // Cria o item numa das opções: um dia existente, ou um dia sem rota (cria o dia antes).
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
          // Dia sem rota: cria o dia vazio (partida = casa, igual à geração automática).
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
              contactType,
            },
          },
        });
        const payload = res.data?.createVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? `Erro ao agendar ${contactNoun(contactType)}`
          );
        }
        return payload;
      },
      {
        successMessage: `${CONTACT_TYPE_LABEL[contactType]} agendad${isRemote ? "o" : "a"}`,
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

  useQueryErrorToast(
    linksQuery.error,
    "Não foi possível carregar os clientes para a visita."
  );

  return {
    options,
    optionsLoading: linksQuery.loading,
    selectedLinkId,
    setSelectedLinkId,
    contactType,
    setContactType,
    isContactTypeEnabled: capacity.isRemoteContactEnabled,
    typeLimit,
    confirmingOverLimit,
    isDayWithoutRoute,
    isDayFull,
    nextDay,
    nextDayHasRoom,
    isLoading,
    handlePrimary,
    handleAddToNextDay,
  };
}
