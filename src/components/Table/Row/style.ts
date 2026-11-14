export const tableRowStyle = "group transition-colors";
// Linha clicável: só o fundo sobe um tom no hover e mais um no clique. O fundo
// do hover é `--bg`, não `--bg3`: com `--bg3` os selos neutros (o número do
// pedido) somem no fundo da linha e viram só um contorno. Sem filete âmbar à
// esquerda — faixa lateral não é linguagem do DS (14/11/2026).
export const tableRowInteractiveStyle =
  "cursor-pointer hover:bg-(--bg) active:bg-(--bg3)";
