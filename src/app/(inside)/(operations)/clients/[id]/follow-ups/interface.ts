import { FollowUp } from "@/utils/followUp";

export interface ClientFollowUpsData {
  follow_ups: {
    edges: { node: FollowUp }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}
