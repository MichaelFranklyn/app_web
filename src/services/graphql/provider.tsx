"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { createApolloClient } from "./client";

export function GraphqlProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
