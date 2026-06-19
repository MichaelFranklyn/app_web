"use client";

import { useToast } from "@/components/Toast";
import { useCallback, useState } from "react";

export interface AsyncActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
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

        if (options?.successMessage) {
          toast({
            variant: "success",
            title: "Sucesso",
            description: options.successMessage,
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
