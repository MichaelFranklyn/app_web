"use client";

import { useToast } from "@/components/Toast";
import { useCallback, useState } from "react";

export interface AsyncActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  /**
   * Texto fixo ou derivado do resultado. A forma de função existe para quando o
   * backend é quem sabe o que aconteceu — ex.: uma entrega que não abasteceu o
   * estoque porque o cliente não está na carteira daquela fábrica.
   */
  successMessage?: string | ((data: T) => string | undefined);
  errorMessage?: string;
}

export const useAsyncAction = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T>(
      actionFn: () => Promise<T>,
      options?: AsyncActionOptions<T>
    ): Promise<T | undefined> => {
      setIsLoading(true);

      try {
        const result = await actionFn();

        options?.onSuccess?.(result);

        const successMessage =
          typeof options?.successMessage === "function"
            ? options.successMessage(result)
            : options?.successMessage;

        if (successMessage) {
          toast({
            variant: "success",
            title: "Sucesso",
            description: successMessage,
          });
        }

        return result;
      } catch (error) {
        options?.onError?.(error);

        toast({
          variant: "error",
          title: "Erro",
          description:
            options?.errorMessage ??
            (error instanceof Error ? error.message : "Erro desconhecido"),
        });

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { execute, isLoading };
};
