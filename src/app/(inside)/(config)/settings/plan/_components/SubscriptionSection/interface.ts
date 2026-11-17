export type SubscriptionStatus = "PENDING" | "ACTIVE" | "OVERDUE" | "CANCELED";
export type SubscriptionCycle = "MONTHLY" | "YEARLY";

export interface MySubscription {
  /** Falso enquanto o sistema de pagamento não está ligado no servidor. */
  isBillingEnabled: boolean;
  /** Até quando o acesso está pago (ISO, sem hora). */
  paidUntil: string | null;
  /** Nulo quando a empresa nunca assinou. */
  status: SubscriptionStatus | null;
  plan: string | null;
  planLabel: string | null;
  cycle: SubscriptionCycle | null;
  extraUsers: number;
  /** Decimal do GraphQL: chega como string. */
  value: string | number | null;
  overdueSince: string | null;
  /** Página de pagamento da cobrança em aberto. */
  invoiceUrl: string | null;
}

export interface MySubscriptionQueryData {
  mySubscription: {
    status: boolean;
    message: string | null;
    data: MySubscription | null;
  } | null;
}

export interface CancelSubscriptionData {
  cancelSubscription: { status: boolean; message: string | null } | null;
}

export type AlertVariant = "info" | "success" | "warning" | "error" | "neutral";

export interface SubscriptionCopy {
  variant: AlertVariant;
  title: string;
  description: string;
  canPay: boolean;
  canSubscribe: boolean;
  canCancel: boolean;
}
