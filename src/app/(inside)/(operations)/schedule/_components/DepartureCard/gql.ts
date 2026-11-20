import { gql } from "@apollo/client";

// Altera o ponto de partida do dia (casa do vendedor ou endereço personalizado).
// O backend recalcula a rota inteira (ordem + distância) a partir da nova origem,
// então a Agenda refaz a consulta após o sucesso.
export const UPDATE_DAY_DEPARTURE_MUTATION = gql`
  mutation UpdateDayDeparture(
    $id: UUID!
    $input: UpdateVisitScheduleDayInput!
  ) {
    updateVisitScheduleDay(id: $id, input: $input) {
      status
      message
      data {
        id
        departureType
        departureAddress
      }
    }
  }
`;
