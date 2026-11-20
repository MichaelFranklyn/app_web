/**
 * As telas que juntam os escritórios da pessoa: a Agenda (semana, mês e a
 * Rota do dia) e o Montar semana, que mostra o score das fábricas de lá. O
 * resto do sistema é do escritório da sessão.
 */
export const isAllOfficesScreen = (pathname: string): boolean =>
  pathname === "/schedule" || pathname.startsWith("/schedule/");
