import { FollowUp, FollowUpSituation } from "@/utils/followUp";

export interface FollowUpsData {
  follow_ups: {
    edges: { node: FollowUp }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface FollowUpCountsData {
  clientFollowUpCounts: { situation: FollowUpSituation; count: number }[];
}

export interface FollowUpsContentProps {
  /** 1ª página lida no servidor, para o cache nascer quente. */
  initialData?: FollowUpsData;
  /** Gestor: filtra por responsável e vê de quem é cada contato. */
  canAssign: boolean;
}
