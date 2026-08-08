import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { clientName } from "@/utils/company";
import { extractSelectValue } from "@/utils/form";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  CREATE_FIXED_SCHEDULE_MUTATION,
  UPDATE_FIXED_SCHEDULE_MUTATION,
  WALLET_CLIENTS_QUERY,
} from "../gql";
import {
  CreateFixedScheduleResponse,
  FixedScheduleNode,
  UpdateFixedScheduleResponse,
} from "../interface";
import { CADENCE_OPTIONS, optionalIsoDate, WEEKDAY_OPTIONS } from "../utils";

interface WalletData {
  sellerClientFactoryList: {
    edges: {
      node: {
        id: string;
        clientId: string;
        client: {
          id: string;
          razaoSocial: string;
          nomeFantasia: string | null;
        } | null;
      };
    }[];
  };
}

export interface FixedScheduleFormProps {
  sellerId: string;
  /** Compromisso em edição. Ausente = está sendo criado. */
  schedule?: FixedScheduleNode;
  /** Clientes que já têm dia marcado — fora do select na criação. */
  takenClientIds?: string[];
  onDone: () => void;
}

export function useFixedScheduleForm({
  sellerId,
  schedule,
  takenClientIds = [],
  onDone,
}: FixedScheduleFormProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  // A recusa do backend fica NA TELA, não num toast que some: ela é uma decisão
  // a tomar ("este dia não cabe, escolha outro"), e o gestor precisa reler o
  // motivo enquanto mexe nos campos.
  const [refusal, setRefusal] = useState<string | null>(null);
  const isEditing = Boolean(schedule);

  const { data, error } = useQuery<WalletData>(WALLET_CLIENTS_QUERY, {
    variables: {
      input: {
        first: 500,
        filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
      },
    },
    skip: !open || isEditing,
  });

  const clientOptions = useMemo(() => {
    const taken = new Set(takenClientIds);
    const seen = new Set<string>();
    return (data?.sellerClientFactoryList.edges ?? [])
      .flatMap(({ node }) => {
        if (!node.client || taken.has(node.clientId) || seen.has(node.clientId))
          return [];
        seen.add(node.clientId);
        return [{ value: node.clientId, label: clientName(node.client) }];
      })
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [data, takenClientIds]);

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "fixed",
        sections: [
          {
            id: "fields",
            fields: [
              // O cliente identifica o compromisso: trocá-lo numa edição seria
              // criar outro. Quem quer mudar de cliente remove e cadastra.
              ...(isEditing
                ? []
                : [
                    {
                      name: "clientId",
                      type: "select-single" as const,
                      label: "Cliente",
                      required: true,
                      placeholder:
                        clientOptions.length === 0
                          ? "Nenhum cliente disponível na carteira"
                          : "Selecione o cliente",
                      options: clientOptions,
                    },
                  ]),
              {
                name: "weekday",
                type: "select-single",
                label: "Dia da semana",
                required: true,
                placeholder: "Selecione o dia",
                options: WEEKDAY_OPTIONS,
                hint: "O dia em que o vendedor passa neste cliente.",
              },
              {
                name: "intervalWeeks",
                type: "select-single",
                label: "Com que frequência",
                required: true,
                placeholder: "Selecione a frequência",
                options: CADENCE_OPTIONS,
              },
              {
                name: "startsOn",
                type: "date",
                label: "A partir de (opcional)",
                hint: "Em branco, vale já a partir da próxima ocorrência.",
              },
              {
                name: "endsOn",
                type: "date",
                label: "Até (opcional)",
                hint: "Só para compromisso com prazo combinado.",
              },
              {
                name: "notes",
                type: "text",
                label: "Observação (opcional)",
                placeholder: "Ex: o comprador só atende pela manhã",
              },
            ],
          },
        ],
      },
    ],
    [clientOptions, isEditing]
  );

  const initialData = useMemo(() => {
    if (!schedule) return undefined;
    return {
      weekday:
        WEEKDAY_OPTIONS.find((o) => o.value === String(schedule.weekday)) ??
        null,
      intervalWeeks:
        CADENCE_OPTIONS.find(
          (o) => o.value === String(schedule.intervalWeeks)
        ) ?? null,
      startsOn: schedule.startsOn,
      endsOn: schedule.endsOn,
      notes: schedule.notes,
    };
  }, [schedule]);

  const [createSchedule] = useMutation<CreateFixedScheduleResponse>(
    CREATE_FIXED_SCHEDULE_MUTATION
  );
  const [updateSchedule] = useMutation<UpdateFixedScheduleResponse>(
    UPDATE_FIXED_SCHEDULE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // A recusa some quando o modal reabre: ela descreve o dia que foi tentado, e
  // manter o texto de ontem ao lado de campos novos confunde mais que ajuda.
  useEffect(() => {
    if (open) setRefusal(null);
  }, [open]);

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setRefusal(null);
    const weekday = Number(extractSelectValue(data.weekday));
    const intervalWeeks = Number(extractSelectValue(data.intervalWeeks));
    const startsOn = optionalIsoDate(data.startsOn);
    const endsOn = optionalIsoDate(data.endsOn);
    const notes = String(data.notes ?? "").trim() || null;

    await execute(
      async () => {
        if (schedule) {
          const res = await updateSchedule({
            variables: {
              id: schedule.id,
              input: { weekday, intervalWeeks, startsOn, endsOn, notes },
            },
          });
          if (!res.data?.updateFixedSchedule?.status) {
            throw new Error(
              res.data?.updateFixedSchedule?.message ?? "Erro ao salvar"
            );
          }
          return res.data.updateFixedSchedule;
        }

        const clientId = extractSelectValue(data.clientId);
        if (!clientId) throw new Error("Selecione o cliente.");
        const res = await createSchedule({
          variables: {
            input: {
              sellerId,
              clientId,
              weekday,
              intervalWeeks,
              startsOn,
              endsOn,
              notes,
            },
          },
        });
        if (!res.data?.createFixedSchedule?.status) {
          throw new Error(
            res.data?.createFixedSchedule?.message ?? "Erro ao salvar"
          );
        }
        return res.data.createFixedSchedule;
      },
      {
        successMessage: isEditing ? "Dia fixo atualizado" : "Dia fixo marcado",
        errorMessage: "Não foi possível salvar o dia fixo.",
        onError: (err) => setRefusal(err instanceof Error ? err.message : null),
        onSuccess: () => {
          handleClose(false);
          onDone();
        },
      }
    );
  };

  useQueryErrorToast(
    error,
    "Não foi possível carregar a carteira do vendedor."
  );

  return {
    open,
    handleClose,
    formRef,
    steps,
    initialData,
    handleSubmit,
    isLoading,
    isEditing,
    /** Motivo da recusa do backend, para o alerta dentro do modal. */
    refusal,
    hasClients: isEditing || clientOptions.length > 0,
  };
}
