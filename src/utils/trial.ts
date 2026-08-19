/**
 * Duração do teste grátis, em dias.
 *
 * Espelha `TRIAL_PERIOD_DAYS` em
 * `app_user/app/modules/companies/use_cases/register_company.py` — o número que
 * as telas públicas anunciam é o mesmo que o `registerCompany` grava em
 * `trial_ends_at`. Mudou lá, muda aqui.
 *
 * Mora em `utils` porque tem dois consumidores em grupos de rota diferentes: a
 * vitrine (`(marketing)`) e a porta de entrada (`(auth)`). Enquanto o número
 * vivia só dentro da landing, a tela de login dizia apenas "teste grátis" —
 * vago de um lado e específico do outro, sobre a mesma oferta.
 */
export const TRIAL_DAYS = 7;
