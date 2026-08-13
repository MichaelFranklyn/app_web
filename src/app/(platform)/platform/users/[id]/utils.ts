/** As últimas ações da pessoa. A leitura completa, com filtro e paginação, é
 * a tela de histórico — aqui basta o suficiente para reconstituir o que ela
 * estava fazendo quando o problema aconteceu. */
export const ACTIVITY_LIMIT = 20;

/** Variables da lista. Compartilhadas entre SSR e cliente porque precisam
 * bater byte a byte, senão o cache semeado não é encontrado. */
export const activityVariables = (userId: string) => ({
  input: {
    first: ACTIVITY_LIMIT,
    after: null,
    filters: [{ field: "user_id", value: userId }],
  },
});
