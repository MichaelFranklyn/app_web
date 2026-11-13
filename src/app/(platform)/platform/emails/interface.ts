/** SENT = a Brevo aceitou; FAILED = recusou ou caiu; SUPPRESSED = nem tentou,
 * o endereço está na lista de bloqueio. */
export type EmailMessageStatus = "SENT" | "FAILED" | "SUPPRESSED";

export interface EmailLogEntry {
  id: string;
  toEmail: string;
  subject: string;
  status: EmailMessageStatus;
  error: string | null;
  /** O que a Brevo contou depois pelo webhook: delivered, hard_bounce, spam… */
  lastEvent: string | null;
  lastEventAt: string | null;
  createdAt: string;
}

export interface EmailSuppressionInfo {
  email: string;
  /** hard_bounce, invalid_email, spam ou unsubscribed. */
  reason: string;
  since: string;
}

export interface EmailLogReport {
  /** O endereço pesquisado (normalizado); nulo = todos. */
  email: string | null;
  sentToday: number;
  dailyQuota: number;
  suppression: EmailSuppressionInfo | null;
  messages: EmailLogEntry[];
}

export interface EmailLogQueryData {
  platformEmailLog: { data: EmailLogReport | null };
}

export interface EmailsContentProps {
  seed: EmailLogQueryData | null;
}
