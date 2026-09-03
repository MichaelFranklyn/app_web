import { SupportCase, SupportStatus } from "@/utils/support";

export interface SupportCasesData {
  support_cases: {
    edges: { node: SupportCase }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface SupportCountsData {
  clientSupportCounts: { status: SupportStatus; count: number }[];
}
