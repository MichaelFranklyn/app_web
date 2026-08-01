import { gql } from "@apollo/client";

/**
 * Linhas de comissão (uma por parcela) para TODOS os gráficos da seção.
 *
 * O resolver `commissions` agrega server-side por parcela e não aceita recorte
 * por período, então a busca é uma só: os gráficos compartilham este documento
 * e recortam no cliente. Como a query e as variáveis são as mesmas, o cache do
 * Apollo (cache-first) atende os demais gráficos sem ir à rede de novo — seis
 * cards, um request.
 *
 * `sellerId` é omitido de propósito: o gráfico por vendedor precisa de todos os
 * vendedores, e o filtro de vendedor da página é aplicado no cliente. Vendedor
 * logado continua escopado pelo backend (só vê as próprias comissões).
 */
export const COMMISSION_ROWS_QUERY = gql`
  query CommissionRowsForCharts {
    commissions {
      rows {
        receiveDate
        amount
        installmentAmount
        status
        seller {
          id
          name
        }
        factory {
          id
          nickname
          nomeFantasia
          razaoSocial
        }
      }
    }
  }
`;
