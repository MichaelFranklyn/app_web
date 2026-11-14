/**
 * O vídeo de apresentação da rotina (14/11/2026: EM STANDBY).
 *
 * Roteiro combinado: um vídeo de marketing que passa pelas telas narrando o
 * que o usuário faz, com foco na rotina — montar a semana → organizar pelos
 * dias → acompanhar a agenda → seguir a rota do dia no celular.
 *
 * Enquanto `src` for `null`, a seção mostra a moldura com o selo "Em breve".
 * Para publicar: suba o arquivo em `public/marketing/` (mp4 H.264, de
 * preferência com legenda .vtt) e preencha `src` — e `captions`, se houver.
 */
export const ROUTINE_VIDEO: {
  src: string | null;
  captions: string | null;
  poster: string;
} = {
  src: null,
  captions: null,
  poster: "/marketing/agenda-semana.webp",
};
