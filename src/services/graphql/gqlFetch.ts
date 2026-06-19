import { getServerCookie } from "@/utils/cookies/serverCookie";
import { DocumentNode, OperationDefinitionNode, print } from "graphql";

const GQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_API_HOST || "";

export class GqlNotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "GqlNotFoundError";
  }
}

export interface CacheOptions {
  tags?: string[];
  revalidate?: number | false;
  noCache?: boolean;
}

export interface GqlQueryOptions<TVariables = Record<string, unknown>> {
  query: DocumentNode | string;
  variables?: TVariables;
  cache?: CacheOptions;
}

export interface GqlResponse<TData> {
  data: TData | null;
}

export async function gqlFetch<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  { query, variables }: GqlQueryOptions<TVariables>,
  token?: string | null
): Promise<GqlResponse<TData>> {
  const authToken =
    token !== undefined ? token : await getServerCookie<string>("token");

  let queryString: string;
  let operationName: string | undefined;

  if (typeof query === "string") {
    queryString = query;
    operationName = query.match(/(?:query|mutation|subscription)\s+(\w+)/)?.[1];
  } else {
    queryString = print(query);
    const operationDef = query.definitions.find(
      (def) => def.kind === "OperationDefinition"
    ) as OperationDefinitionNode | undefined;
    operationName = operationDef?.name?.value;
  }

  const uri = operationName ? `${GQL_URI}?op=${operationName}` : GQL_URI;

  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    body: JSON.stringify({ query: queryString, variables, operationName }),
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403)
      throw new Error("UNAUTHORIZED");

    if (response.status === 404) throw new GqlNotFoundError();
    throw new Error(`NETWORK_ERROR: ${response.status}`);
  }

  const json = (await response.json()) as {
    data?: TData;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) throw new Error(json.errors[0].message);

  return { data: json.data ?? null };
}
