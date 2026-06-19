import { parseJwtServer } from "@/utils/auth/jwt";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { unstable_cache } from "next/cache";
import { gqlFetch, GqlQueryOptions } from "./gqlFetch";

// ─── Backend response shapes ────────────────────────────── //

type BackendDataResponse = {
  status: boolean;
  code: number;
  message: string;
  data: unknown;
};

type BackendConnectionResponse = {
  edges: unknown[];
  pageInfo: unknown;
  totalCount: number;
};

function isDataResponse(v: unknown): v is BackendDataResponse {
  return (
    typeof v === "object" &&
    v !== null &&
    "status" in v &&
    "data" in v &&
    "message" in v
  );
}

function isConnectionResponse(v: unknown): v is BackendConnectionResponse {
  return (
    typeof v === "object" && v !== null && "edges" in v && "totalCount" in v
  );
}

// ─── token é lido fora do unstable_cache e passado como argumento ── //

async function fetchAndExtract(
  key: string,
  options: GqlQueryOptions,
  token: string | null
): Promise<unknown> {
  const response = await gqlFetch(options, token);
  if (!response.data) return null;

  const rawData = response.data as Record<string, unknown>;
  const field = rawData[key] ?? rawData[Object.keys(rawData)[0]];

  if (isDataResponse(field)) {
    if (!field.status) throw new Error(field.message);
    return field.data;
  }

  if (isConnectionResponse(field)) return field;

  return field ?? null;
}

export async function executeServerQueries<TResult>(
  queries: Record<string, GqlQueryOptions>
): Promise<TResult> {
  const token = await getServerCookie<string>("token");
  const decoded = token ? parseJwtServer(token) : null;
  const userId = decoded?.sub ?? "anon";

  const results = await Promise.all(
    Object.entries(queries).map(async ([key, options]) => {
      const {
        tags = [],
        revalidate = 1,
        noCache = false,
      } = options.cache ?? {};

      const cached = unstable_cache(
        (t: string | null) => fetchAndExtract(key, options, t),
        [key, userId, JSON.stringify(options.variables ?? {})],
        {
          tags: ["global", `user-${userId}`, ...tags],
          revalidate: noCache ? 1 : revalidate,
        }
      );

      return [key, await cached(token)];
    })
  );

  return Object.fromEntries(results) as TResult;
}
