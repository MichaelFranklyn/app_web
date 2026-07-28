export interface NewVsReturningPoint {
  month: string;
  newClients: number;
  returningClients: number;
}

export interface NewVsReturningResponse {
  newVsReturningClientsByMonth: NewVsReturningPoint[];
}
