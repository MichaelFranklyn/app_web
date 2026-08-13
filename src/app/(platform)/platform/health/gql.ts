import { gql } from "@apollo/client";

/** O que está falhando ou demorando. Mora na tela de Saúde porque é estado
 * técnico da plataforma — a leitura de negócio do mesmo log é o Histórico. */
export const OPERATION_HEALTH_QUERY = gql`
  query PlatformOperationHealth {
    platformOperationHealth {
      status
      code
      message
      data {
        failing
        slow
        operations {
          operation
          total
          errors
          rejections
          medianMs
          p95Ms
          maxMs
          lastErrorAt
          lastErrorMessage
        }
      }
    }
  }
`;

/** O eixo do TEMPO da saúde técnica: a foto das operações vira filme. Sem isto,
 * a operação que sempre levou dois segundos e a que ficou lenta na semana
 * passada aparecem iguais — e exigem trabalho completamente diferente. */
export const OPERATION_TREND_QUERY = gql`
  query PlatformOperationTrend {
    platformOperationTrend {
      status
      code
      message
      data {
        newOperations
        vanishedOperations
        daily {
          day
          calls
          errors
          p95Ms
        }
        regressions {
          operation
          kind
          callsCurrent
          callsPrevious
          p95Current
          p95Previous
          p95Change
          errorsCurrent
          errorsPrevious
          errorRateCurrent
          errorRatePrevious
          lastErrorMessage
        }
      }
    }
  }
`;

/** Os jobs ao longo do tempo. A última execução responde "rodou hoje?"; a série
 * responde "para onde está indo". */
export const JOB_HISTORY_QUERY = gql`
  query PlatformJobHistory($days: Int) {
    platformJobHistory(days: $days) {
      status
      code
      message
      data {
        jobName
        runs
        failures
        skipped
        lastStatus
        lastStartedAt
        lastSuccessAt
        lastErrorMessage
        medianDurationMs
        lastDurationMs
        durationChange
        series {
          startedAt
          status
          durationMs
        }
      }
    }
  }
`;

export const PLATFORM_HEALTH_QUERY = gql`
  query PlatformHealth {
    platformHealth {
      status
      code
      message
      data {
        databaseRevision
        codeRevision
        hasPendingMigration
        expiredTrials
        jobs {
          jobName
          startedAt
          finishedAt
          status
          errorMessage
          durationMs
        }
      }
    }
  }
`;
