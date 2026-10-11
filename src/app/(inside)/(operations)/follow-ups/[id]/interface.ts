import { FollowUpMutationPayload } from "@/graphql/followUps";
import { FollowUpDetail } from "@/utils/followUp";

export interface FollowUpQueryResponse {
  clientFollowUp: {
    status: boolean;
    message: string;
    data: FollowUpDetail | null;
  };
}

export interface CompleteFollowUpResponse {
  completeClientFollowUp?: FollowUpMutationPayload;
}

export interface RescheduleFollowUpResponse {
  rescheduleClientFollowUp?: FollowUpMutationPayload;
}

export interface CancelFollowUpResponse {
  cancelClientFollowUp?: FollowUpMutationPayload;
}

/** O que os três modais de ação recebem. */
export interface FollowUpActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUpDetail;
  onDone: () => void;
}
