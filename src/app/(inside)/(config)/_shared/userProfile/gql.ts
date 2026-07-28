import { gql } from "@apollo/client";

/**
 * Perfil completo em UMA query: os dados da pessoa (users) e, quando ela também
 * vende, o perfil de vendedor com os contadores e a configuração de rotina —
 * `seller.scheduleConfig` evita uma segunda ida ao servidor só para o resumo.
 */
export const USER_DETAIL_QUERY = gql`
  query UserDetail($id: UUID!) {
    user_detail: user(id: $id) {
      status
      message
      data {
        id
        name
        email
        role
        isActive
        phone
        cpf
        birthDate
        addressZip
        addressStreet
        addressNumber
        addressComplement
        addressNeighborhood
        addressCity
        addressState
        createdAt
        company {
          id
          nomeFantasia
          razaoSocial
        }
        seller {
          id
          name
          region
          isActive
          factoryCount
          clientCount
          totalRevenue
          lastOrderDate
          scheduleConfig {
            id
            maxVisitsPerDay
            workDays
            workStartTime
            workEndTime
            isRemoteContactEnabled
            maxRemoteContactsPerDay
            remoteContactIntervalPct
            avgVisitDurationMin
            isRescheduleSameWeek
            maxRescheduleAttempts
          }
        }
      }
    }
  }
`;
