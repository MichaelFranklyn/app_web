export interface TripRegionOption {
  key: string;
  city: string;
  state: string;
  /** Clientes ativos da carteira do vendedor nesta cidade. */
  clientCount: number;
  /** Destes, quantos têm endereço localizado no mapa. */
  locatedCount: number;
}

export interface TripRegionOptionsData {
  trip_region_options?: TripRegionOption[];
}

export interface TripVisit {
  clientId: string;
  clientName: string;
  city: string;
  score: number;
}

export interface TripDayPlan {
  date: string;
  /** Cidade de onde o dia sai (a da maioria das paradas). */
  city: string | null;
  visits: TripVisit[];
}

export interface TripPlan {
  trip: { id: string } | null;
  days: TripDayPlan[];
  leftOut: TripVisit[];
  ungeocoded: TripVisit[];
  alreadyScheduled: TripVisit[];
  manualConflicts: number;
  skippedDates: string[];
  regionClientCount: number;
  unavailableCount: number;
}

export interface PlanSellerTripResponse {
  planSellerTrip?: {
    status: boolean;
    message: string;
    data: TripPlan | null;
  };
}

export interface TripPeriod {
  from: Date | null;
  to: Date | null;
}
