"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { PROVISION_COMPANY_MUTATION } from "./gql";
import { ProvisionCompanyPayload, ProvisionCompanyResponse } from "./interface";
import { normalizeInput } from "./utils";

/**
 * Cérebro da tela de provisionamento: dispara a mutation e guarda o resultado
 * (empresa + owner + link de primeiro acesso) para a tela de confirmação.
 */
export function useProvisionCompany() {
  const [result, setResult] = useState<ProvisionCompanyPayload | null>(null);
  const [provision] = useMutation<ProvisionCompanyResponse>(
    PROVISION_COMPANY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const submit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await provision({
          variables: { input: normalizeInput(data) },
        });

        const payload = res.data?.provisionCompany;
        if (!payload?.status || !payload.data) {
          throw new Error(
            payload?.message ?? "Não foi possível provisionar a empresa."
          );
        }
        return payload.data;
      },
      {
        successMessage: "Empresa provisionada com sucesso.",
        onSuccess: (payload) => setResult(payload),
      }
    );
  };

  const reset = () => setResult(null);

  return { submit, reset, result, isLoading };
}
