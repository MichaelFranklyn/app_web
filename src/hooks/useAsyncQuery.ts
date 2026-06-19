"use client";

import type { OperationVariables } from "@apollo/client";
import { DocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseAsyncQueryOptions<
  TVariables extends OperationVariables = OperationVariables,
> {
  variables?: TVariables;
  skip?: boolean;
  cache?: boolean;
  autoFetch?: boolean;
}

export interface UseAsyncQueryReturn<
  T,
  TVariables extends OperationVariables = OperationVariables,
> {
  data?: T;
  loading: boolean;
  error?: Error;
  refetch: (variables?: TVariables) => Promise<void>;
}

export const useAsyncQuery = <
  T = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode,
  options?: UseAsyncQueryOptions<TVariables>
): UseAsyncQueryReturn<T, TVariables> => {
  const [refetchInProgress, setRefetchInProgress] = useState(false);
  const prevVariablesRef = useRef<string | undefined>(undefined);

  const {
    data,
    loading,
    error,
    refetch: apolloRefetch,
  } = useQuery(query, {
    variables: options?.variables,
    skip: options?.skip ?? true,
    fetchPolicy: options?.cache === false ? "network-only" : "cache-first",
    errorPolicy: "all",
  });

  const refetch = useCallback(
    async (newVariables?: TVariables) => {
      setRefetchInProgress(true);
      try {
        await apolloRefetch(newVariables);
      } finally {
        setRefetchInProgress(false);
      }
    },
    [apolloRefetch]
  );

  const variablesString = useMemo(
    () => JSON.stringify(options?.variables ?? {}),
    [options?.variables]
  );

  useEffect(() => {
    if (options?.autoFetch && !options?.skip) {
      if (prevVariablesRef.current !== variablesString) {
        prevVariablesRef.current = variablesString;
        refetch(options?.variables);
      }
    }
  }, [variablesString, options?.autoFetch, options?.skip, refetch, options?.variables]);

  return {
    data: data as T,
    loading: loading || refetchInProgress,
    error: error ? new Error(error.message) : undefined,
    refetch,
  };
};
