import { gql } from "@apollo/client";

/**
 * Contrato + uso. Pedir `limits` custa uma contagem por teto no backend, então
 * esta versão é para quem realmente mostra números (a tela do plano e os
 * botões de criar).
 */
export const MY_PLAN_QUERY = gql`
  query MyPlan {
    myPlan {
      data {
        code
        label
        features
        limits {
          key
          label
          limit
          used
          isAtLimit
        }
      }
    }
  }
`;

/**
 * Só o contrato. É o que o guard de página pergunta — e por não pedir `limits`,
 * não paga contagem nenhuma (ver o resolver de `MyPlanType.limits`).
 */
export const MY_PLAN_FEATURES_QUERY = gql`
  query MyPlanFeatures {
    myPlan {
      data {
        code
        label
        features
      }
    }
  }
`;
