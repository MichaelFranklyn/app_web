import { FormStepSchema } from "@/components/FormBuilder";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { clientName } from "@/utils/company";
import { factoryName } from "@/utils/company";
import { negativeOrderHint } from "@/components/ClientFactoryNegative";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { normalizeInput } from "../_shared/orderCreate";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../_shared/orderCoverage";
import {
  coverageField,
  deliveryField,
  freightField,
  notesField,
  orderDateField,
  orderKindField,
  paymentTermField,
  singleSection,
} from "./fields";
import { CLIENT_ASSIGNMENTS_QUERY } from "./gql";
import {
  ClientAssignmentsData,
  NewOrderDetails,
  NewOrderOrigin,
} from "./interface";
import { NewOrderCore } from "./useNewOrderCore";

type VisitOrigin = Extract<NewOrderOrigin, { kind: "visit" }>;

/**
 * Novo pedido lançado de dentro da visita. O vendedor acabou de perguntar o
 * estoque de UMA fábrica do cliente: vendedor, cliente e fábrica já estão
 * decididos, e o pedido fica amarrado à visita que o gerou.
 */
export function useVisitDetails(
  core: NewOrderCore,
  { visitItemId, sellerId, clientId, factoryId }: VisitOrigin
): NewOrderDetails {
  const { formRef, paymentTermOptions } = core;

  // O vínculo desta visita — nomes para o cabeçalho, a negativação e a
  // cadência que sugere a cobertura. A mesma consulta da porta do cliente,
  // recortada até sobrar um.
  const { data, error } = useQuery<ClientAssignmentsData>(
    CLIENT_ASSIGNMENTS_QUERY,
    {
      variables: {
        input: {
          first: 1,
          filters: [
            { field: "client_id", operator: "eq", value: clientId },
            { field: "factory_id", operator: "eq", value: factoryId },
            { field: "seller_id", operator: "eq", value: sellerId },
          ],
        },
      },
    }
  );

  useQueryErrorToast(
    error,
    "Não foi possível carregar o cliente da visita. Tente novamente."
  );

  const link = data?.sellerClientFactoryList?.edges?.[0]?.node ?? null;

  useCoverageSuggestion(formRef, link?.cadence);

  // O pedido nasce durante a visita: a data de hoje é a resposta certa quase
  // sempre, e o vendedor só mexe nela na exceção. Fixada na montagem.
  const [initialData] = useState(() => ({ orderDate: new Date() }));

  const formSteps: FormStepSchema[] = useMemo(
    () =>
      singleSection([
        orderKindField,
        {
          ...orderDateField,
          // A negativação trava o pedido no backend; avisar aqui evita que o
          // vendedor monte o pedido inteiro para levar a recusa no fim.
          hint: link?.isNegative
            ? negativeOrderHint(link.negativeReason)
            : undefined,
        },
        paymentTermField({
          options: paymentTermOptions,
          pendingPlaceholder: null,
          onChange: core.setPaymentTermId,
        }),
        freightField(core.setFreightType),
        deliveryField,
        coverageField(coverageHint(link?.cadence)),
        notesField,
      ]),
    // `core` muda a cada render; as condições que ele contribui já estão
    // listadas, e os setters que ele passa só mexem em estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paymentTermOptions, link]
  );

  return {
    formSteps,
    initialData,
    toInput: (data) => ({
      ...normalizeInput({ ...data, sellerId, clientId, factoryId }),
      visitScheduleItemId: visitItemId,
    }),
    subject: link?.client ? clientName(link.client) : null,
    description: link?.factory
      ? `Pedido de ${factoryName(link.factory)} registrado nesta visita${
          link.seller ? `, por ${link.seller.name}` : ""
        }.`
      : null,
  };
}
