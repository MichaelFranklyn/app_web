import { SelectOption } from "@/components/Input";
import { FormBuilderRef } from "@/components/FormBuilder";
import { RefObject, useEffect, useRef } from "react";

interface Args {
  formRef: RefObject<FormBuilderRef | null>;
  clientId: string;
  factoryId: string;
  /** Condição do nível do cliente (ver usePaymentTermOptions). */
  suggestedId: string | null | undefined;
  options: SelectOption[];
  /** Condição já escolhida — a sugestão nunca passa por cima dela. */
  paymentTermId: string;
  setPaymentTermId: (id: string) => void;
}

/**
 * Deixa o pedido já com a condição do nível do cliente — o cliente do interior
 * abre em 45/75/105, o da capital em 30/60/90. Uma vez por cliente × fábrica e
 * só com o campo vazio: se o vendedor trocar ou limpar, a escolha é dele.
 */
export function useSuggestedPaymentTerm({
  formRef,
  clientId,
  factoryId,
  suggestedId,
  options,
  paymentTermId,
  setPaymentTermId,
}: Args) {
  const appliedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!suggestedId || !clientId || !factoryId) return;
    const key = `${clientId}|${factoryId}`;
    if (appliedFor.current === key) return;
    const option = options.find((o) => o.value === suggestedId);
    if (!option) return;
    appliedFor.current = key;
    if (paymentTermId || formRef.current?.getValues().paymentTermId) return;
    formRef.current?.setValue("paymentTermId", option);
    setPaymentTermId(option.value);
  }, [
    suggestedId,
    clientId,
    factoryId,
    options,
    paymentTermId,
    formRef,
    setPaymentTermId,
  ]);
}
