export interface AuditRow {
  id: string;
  createdAt: string;
  action: string;
  actorEmail: string;
  targetCompanyId: string | null;
  targetLabel: string | null;
  reason: string | null;
  ipAddress: string | null;
}

export interface AuditQueryData {
  platform_audit: {
    edges: { node: AuditRow }[];
    totalCount: number;
  };
}

export interface AuditContentProps {
  initialData: AuditQueryData | null;
}
