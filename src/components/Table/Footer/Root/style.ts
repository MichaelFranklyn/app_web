// flex-wrap: quando o footer estreita, a paginação desce para a própria linha em
// vez de espremer/cortar o texto de info (gap-3 também espaça as linhas).
// Abaixo do desktop, info e paginação empilham CENTRALIZADAS: no celular a
// paginação descia encostada à esquerda e deixava sobra vazia à direita.
export const footerRootStyle =
  "p-10 min-h-[38px] border-t border-(--border) flex flex-wrap items-center justify-between gap-3 max-desktop:flex-col max-desktop:justify-center bg-(--bg3) text-body-sm text-(--color-text-muted)";
