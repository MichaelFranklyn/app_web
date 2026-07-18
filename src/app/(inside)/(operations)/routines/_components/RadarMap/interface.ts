// Coordenadas chegam como string (scalar Decimal do backend) — o componente
// faz o parseFloat antes de plotar.
export interface RadarClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  latitude: string;
  longitude: string;
  addressStreet: string | null;
  addressNumber: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  companyClient: {
    id: string;
    visitScoreTotal: string | null;
  } | null;
}

export interface RadarClientsQueryData {
  radarClients: RadarClient[];
}
