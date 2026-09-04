import { SupportCase } from "@/utils/support";

export interface ClientSupportCasesData {
  support_cases: {
    edges: { node: SupportCase }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}
