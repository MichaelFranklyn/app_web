import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { clientDisplayName } from "@/utils/client";
import { useCompleteList } from "@/hooks/useCompleteList";
import { VISIT_CACHE_FIELDS } from "@/utils/cacheFields";
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
  sellerId: string;
  capacity: RoutineCapacity;
  onDone: () => void;
}

// Carteira do vendedor carregada por inteiro (ver useCompleteList).
const getLinks = (d: SellerClientLinksQueryData) => d.seller_client_links;

export function useAddVisit({
  open,
  onOpenChange,
  day,
  date,
  scheduleId,
  sellerId,
  capacity,
  onDone,
}: Params) {
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [contactType, setContactType] = useState<VisitContactType>("IN_PERSON");

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
  const invalidateClient = useInvalidateQueriesClient();

  // Reseta o estado sempre que o modal abre.
  useEffect(() => {
    if (open) {
      setSelectedLinkId(null);
      setContactType("IN_PERSON");
    }
  }, [open]);

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

  // Cria o item no dia, ou num dia sem rota (cria o dia antes). Não há teto
  // de visitas por dia desde 18/10/2026: a quantidade é do vendedor.
  const runCreate = () =>
    execute(
      async () => {
        let scheduleDayId: string;
        let plannedOrder: number;

        if (day) {
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
          // A visita nova entra também no histórico da ficha do cliente.
          void invalidateClient(VISIT_CACHE_FIELDS);
        },
      }
    );

  const handlePrimary = () => {
    if (!selectedLinkId) return;
    runCreate();
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
    isDayWithoutRoute,
    isLoading,
    handlePrimary,
  };
}
