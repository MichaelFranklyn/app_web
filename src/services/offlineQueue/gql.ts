import { gql } from "@apollo/client";

// Documentos próprios da fila, com nome de operação próprio: no log do backend
// (`?op=`) e no mock do E2E dá para distinguir o envio atrasado do envio na
// hora. Pedem o mínimo — quem envia depois não tem tela esperando o retorno.
//
// A exceção é o `data { id status }` da visita: o Apollo normaliza a resposta
// e o card já sai do cache com o status novo no instante em que a entrada deixa
// a fila. Sem isso o checkbox desmarcava até a rotina recarregar.

export const OFFLINE_VISIT_STATUS_MUTATION = gql`
  mutation OfflineUpdateVisitStatus(
    $id: UUID!
    $input: UpdateVisitScheduleItemInput!
  ) {
    updateVisitScheduleItem(id: $id, input: $input) {
      status
      message
      data {
        id
        status
      }
    }
  }
`;

export const OFFLINE_STOCK_OBSERVATIONS_MUTATION = gql`
  mutation OfflineSaveStockObservations(
    $itemId: UUID!
    $observations: [UpsertStockObservationInput!]!
    $observedOn: Date
  ) {
    saveVisitStockObservations(
      itemId: $itemId
      observations: $observations
      observedOn: $observedOn
    ) {
      status
      message
    }
  }
`;
